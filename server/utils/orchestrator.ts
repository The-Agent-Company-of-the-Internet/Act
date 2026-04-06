import * as z from "zod";
import { createDeepAgent, createSubAgentMiddleware } from "deepagents";
import { ChatOpenRouter } from "@langchain/openrouter";
import { ChatGroq } from "@langchain/groq";
import { tool } from "langchain";
import { interrupt, Command } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph';
import { getDb } from "../../db";
import { connectRedis } from "../../db/redis";
import { agents, tasks, taskLogs, stepupRequests } from "../../db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import Firecrawl from '@mendable/firecrawl-js';
import { tavily } from '@tavily/core';


async function writeLog(taskId: string, agentRole: string, message: string, tokenScope?: string) {
  const redis = connectRedis();
  const log = {
    id: `log_${nanoid(8)}`,
    taskId,
    agentRole,
    message,
    tokenScope: tokenScope ?? null,
    createdAt: new Date(),
  }
  await getDb().insert(taskLogs).values(log);
  console.log("Adding log to redis and db")
  console.log("Log value: ", JSON.stringify(log))
  console.log("Main log = ", log)
  await redis.rpush(`task:${taskId}:logs`, JSON.stringify(log))
}

async function updateTaskStatus(taskId: string, status: string) {
  const redis = connectRedis()
  await getDb().update(tasks)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
  await redis.set(`task:${taskId}:status`, status)
}

export async function runOrchestrator(taskId: string, agentId: string) {
  const config = useRuntimeConfig();
  const [task] = await getDb().select().from(tasks).where(eq(tasks.id, taskId))
  const [agent] = await getDb().select().from(agents).where(eq(agents.id, agentId))
  
  if (!task || !agent) {
    console.error('Task or agent not found', taskId, agentId)
    return
  }
  
  await updateTaskStatus(taskId, 'running')
  await writeLog(taskId, 'orchestrator', `Task received. Prompt: "${task.prompt}". Budget: $${(task.budgetCents / 100).toFixed(2)}.`)
  
  
  const tavilyClient = tavily({ apiKey: config.tavilyApiKey })
  const firecrawlClient = new Firecrawl({ apiKey: config.firecrawlApiKey })
  
  const searchWeb = tool(
    async ({ query }) => {
      await writeLog(taskId, 'researcher', `Searching web for: "${query}"`, 'read')
      const results = await tavilyClient.search(query, { maxResults: 5 })
      const summary = results.results.map((r: any) => `- ${r.title}: ${r.url}\n  ${r.content}`).join('\n')
      return summary
    }, {
      name: "search_web",
      description: "Search the web for information. Use this to find websites, APIs, services, and pricing.",
      schema: z.object({
        query: z.string().describe("The search query"),
      })
    }
  )
  
  const scrapePage = tool(
    async ({ pageUrl }) => {
      await writeLog(taskId, 'comparator', `Scraping page: ${pageUrl}`, 'read');
      const result = await firecrawlClient.scrape(pageUrl, { formats: ['markdown'] })
      if (!result) return 'Failed to scrape page'
      return (result as any).markdown?.slice(0, 3000) ?? 'No content'
    }, {
      name: "scrape_page",
      description: "Scrape a specific webpage and return its content. Use this to get exact information like pricing and other details from a page.",
      schema: z.object({
        pageUrl: z.string().describe('The URL to scrape'),
      }),
    }
  )
  
  const requestPayment = tool(
    async ({ service, amount, description }) => {
      await writeLog(taskId, 'purchaser', `Requesting step-up auth to pay $${amount.toFixed(2)} for ${service}`, 'purchase')
      const stepupId = `act_stepup_${nanoid(10)}`;
      await getDb().insert(stepupRequests).values({
        id: stepupId,
        taskId,
        agentId,
        userId: task.userId,
        action: `Subscribe to ${service}: ${description}`,
        amountCents: Math.round(amount * 100),
        approved: null,
        createdAt: new Date(),
      })
      await updateTaskStatus(taskId, 'stepup_pending')
      const decision = interrupt({
        type: 'payment_approval',
        stepupId,
        service,
        amount,
        description,
        message: `Agent wants to pay $${amount.toFixed(2)} for ${service}. Approve or deny.`,
      }) as { approved: boolean }
      
      if (decision.approved) {
        await updateTaskStatus(taskId, 'running')
        await writeLog(taskId, 'purchaser', `Payment approved. Subscribing to ${service} for $${amount.toFixed(2)}.`, 'purchase')
        // update agent spent cents
        await getDb().update(agents)
          .set({ spentCents: agent.spentCents + Math.round(amount * 100) })
          .where(eq(agents.id, agentId))
        return `Payment approved and processed for ${service} at $${amount.toFixed(2)}/mo.`
      } else {
        await writeLog(taskId, 'purchaser', `Payment denied by user for ${service}.`, 'purchase')
        return `Payment denied by user. Task cannot complete without this service.`
      }
      
    }, {
      name: "request_payment",
      description: "Request human approval to make a payment for a service. Always use this before any purchase. Requires step-up authorization.",
      schema: z.object({
        service: z.string().describe("Name of the service to purchase"),
        amount: z.number().describe("Monthly cost in dollars"),
        description: z.string().describe("What this service does and why it was chosen")
      })
    }
  )
  
  const agentModel = new ChatGroq({
    model: "openai/gpt-oss-20b",
    apiKey: config.groqApiKey,
    temperature: 0,
    maxRetries: 1,
    configuration: {
      defaultHeaders: {
        'HTTP-Referer': 'https://theinternetagentcompany.com',
        'X-Title': 'Act',
      },
    },
    stream: false,
  });
  
  const researcherSubagent = {
    name: 'researcher',
    description: 'Searches the web to find websites, candidate services, APIs, or solutions that match the task requirements.',
    systemPrompt: `You are a research agent. Your job is to search the web and find websites, services or APIs that match what the user needs.
    Use search_web to find candidates. Return a concise list of candidates with their URLs and approximate pricing.
    Keep your response under 400 words. Return only the essential findings.`,
    tools: [searchWeb],
  }
  
  const comparatorSubagent = {
    name: 'comparator',
    description: 'Scrapes pricing pages and compares candidates to find the best option within budget.',
    systemPrompt: `You are a comparison agent. You receive a list of candidate services and must scrape their pricing pages if they have one to find exact costs.
    Use scrape_page for each candidate URL. Compare price, features, and fit for the requirement.
    Return: the winning service, its price, its URL, and a one-sentence reason why it won.
    Keep response under 300 words.`,
    tools: [scrapePage],
  }
  
  const purchaserSubagent = {
    name: 'purchaser',
    description: 'Handles payment for the chosen service. Always requires human step-up authorization before proceeding.',
    systemPrompt: `You are a purchasing agent. You receive the winning service and its price.
    You MUST use request_payment to request human approval before any purchase. Never skip this step.
    If approved, confirm the purchase. If denied, report back that the task could not complete.`,
    tools: [requestPayment],
  }
  
  const checkpointer = new MemorySaver()
  
  console.log("ORCHESTRATOR FILE: AFTER CHECKPIONT REACHED\n ENTERING DEEPAGENT CREATION")
  
  // const subagent = createSubAgentMiddleware({})
  
  const orchestrator = createDeepAgent({
    model: agentModel,
    tools: [searchWeb, scrapePage, requestPayment],
    subagents: [researcherSubagent, comparatorSubagent, purchaserSubagent],
    checkpointer,
    systemPrompt: `You are an orchestrator agent managing a task on behalf of a user.
    Task: ${task.prompt}
    Budget: $${(task.budgetCents / 100).toFixed(2)} maximum
  
    IMPORTANT:
    - Always delegate to your subagents. Use researcher first, then comparator, then purchaser.
    - Never exceed the budget.
    - Never make payments without going through the purchaser subagent.
    - Be concise. The user can see your progress in real time.`,
  })
  
  console.log("Orchestrator deep agent: ", orchestrator);
  
  const threadId = `task_${taskId}`
  const runConfig = { configurable: { thread_id: threadId } }
  
  console.log("ORCHESTRATOR INVOKE BLOCK - OUTER: ", runConfig)
  try {
    console.log("ORCHESTRATOR INVOKE BLOCK")
    await writeLog(taskId, 'orchestrator', 'Spawning sub-agents: researcher, comparator, purchaser')
    let result = await orchestrator.invoke({
      messages: [{ role: 'user', content: task.prompt }],
    }, runConfig)
    console.log("ORCHESTRATOR INVOKE BLOCK ACTIVATED")
    
    console.log("Orchestrator result is: ", result)
    
    // console.log('Orchestrator result messages:', JSON.stringify(result.messages?.map((m: any) => ({
    //   type: m._getType?.() ?? m.type,
    //   content: typeof m.content === 'string' ? m.content.slice(0, 200) : m.content
    // })), null, 2))
    
    while (result.__interrupt__) {
      await writeLog(taskId, 'orchestrator', 'Task paused — awaiting human step-up authorization.')
      
      // wait for human approval — poll Redis every 3 seconds
      const redis = connectRedis();
      let approved: boolean | null = null;
      
      while (approved === null) {
        await new Promise(r => setTimeout(r, 3000))
        const val = await redis.get(`task:${taskId}:stepup_decision`)
        if (val === 'approved') approved = true
        if (val === 'denied') approved = false
      }
      
      // clear the decision key
      await redis.del(`task:${taskId}:stepup_decision`)
      
      result = await orchestrator.invoke(
        new Command({ resume: { approved } }),
        runConfig
      )
    }
    
    console.log("ORCHESTRATOR FILE: LAST MESSAGE TO GET")
    const lastMessage = result.messages?.[result.messages.length - 1]
    const resultText = typeof lastMessage?.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage?.content)
    
    await getDb().update(tasks)
      .set({ status: 'completed', result: resultText, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
    
    await connectRedis().set(`task:${taskId}:status`, 'completed')
    await writeLog(taskId, 'orchestrator', `Task completed. Result: ${resultText}`)
  } catch (err: any) {
    console.error('Orchestrator error:', err)
    await updateTaskStatus(taskId, 'failed')
    await writeLog(taskId, 'orchestrator', `Task failed: ${err.message}`)
  }
}