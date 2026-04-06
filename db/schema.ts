import { 
  pgTable, 
  text, 
  integer, 
  timestamp, 
  boolean,
  pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ──
export const agentStatusEnum = pgEnum('agent_status', [
  'idle', 
  'running', 
  'paused', 
  'stepup_pending'
])

export const taskStatusEnum = pgEnum('task_status', [
  'queued',
  'running', 
  'stepup_pending',
  'completed', 
  'failed',
  'cancelled'
])

export const tokenGrantStatusEnum = pgEnum('token_grant_status', [
  'active',
  'expired',
  'revoked'
])

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'approved',
  'denied',
  'failed'
])

// ── Agents ──
export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  scopes: text('scopes').array().notNull().default([]),
  status: agentStatusEnum('status').notNull().default('idle'),
  budgetCents: integer('budget_cents').notNull().default(0),
  spentCents: integer('spent_cents').notNull().default(0),
  parentAgentId: text('parent_agent_id'),
  auth0ClientId: text('auth0_client_id'),
  stripePaymentMethodId: text('stripe_payment_method_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Tasks ──
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  prompt: text('prompt').notNull(),
  status: taskStatusEnum('status').notNull().default('queued'),
  budgetCents: integer('budget_cents').notNull().default(0),
  spentCents: integer('spent_cents').notNull().default(0),
  result: text('result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Task Logs ──
export const taskLogs = pgTable('task_logs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  agentRole: text('agent_role').notNull(), // orchestrator | researcher | comparator | purchaser
  message: text('message').notNull(),
  tokenScope: text('token_scope'),
  metadata: text('metadata'), // JSON string for any extra data
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Token Grants ──
export const tokenGrants = pgTable('token_grants', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  service: text('service').notNull(),
  scope: text('scope').notNull(),
  grantedByAgentId: text('granted_by_agent_id'),
  status: tokenGrantStatusEnum('status').notNull().default('active'),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Transactions ──
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  amountCents: integer('amount_cents').notNull(),
  description: text('description'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  status: transactionStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Step-up Auth Requests ──
export const stepupRequests = pgTable('stepup_requests', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  action: text('action').notNull(), // description of what the agent wants to do
  amountCents: integer('amount_cents'),
  approved: boolean('approved'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Relations ──
export const agentsRelations = relations(agents, ({ many, one }) => ({
  tasks: many(tasks),
  tokenGrants: many(tokenGrants),
  transactions: many(transactions),
  stepupRequests: many(stepupRequests),
  parentAgent: one(agents, {
    fields: [agents.parentAgentId],
    references: [agents.id],
  }),
  childAgents: many(agents),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  agent: one(agents, {
    fields: [tasks.agentId],
    references: [agents.id],
  }),
  logs: many(taskLogs),
  tokenGrants: many(tokenGrants),
  transactions: many(transactions),
  stepupRequests: many(stepupRequests),
}))

export const taskLogsRelations = relations(taskLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLogs.taskId],
    references: [tasks.id],
  }),
}))

export const tokenGrantsRelations = relations(tokenGrants, ({ one }) => ({
  agent: one(agents, {
    fields: [tokenGrants.agentId],
    references: [agents.id],
  }),
  task: one(tasks, {
    fields: [tokenGrants.taskId],
    references: [tasks.id],
  }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  agent: one(agents, {
    fields: [transactions.agentId],
    references: [agents.id],
  }),
  task: one(tasks, {
    fields: [transactions.taskId],
    references: [tasks.id],
  }),
}))

export const stepupRequestsRelations = relations(stepupRequests, ({ one }) => ({
  task: one(tasks, {
    fields: [stepupRequests.taskId],
    references: [tasks.id],
  }),
  agent: one(agents, {
    fields: [stepupRequests.agentId],
    references: [agents.id],
  }),
}))