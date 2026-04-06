<script setup lang="ts">
definePageMeta({
  layout: "actlayout",
  middleware: ["auth"]
})

useSeoMeta({
  title: "Act | New Task"
})

const { data: agents } = await useFetch('/api/agents')

const selectedAgentId = ref<string>("")
const taskPrompt = ref<string>("")
const budgetCap = ref<number>(1.00)

async function createTask() {
  const task = await $fetch('/api/tasks', {
    method: 'POST',
    body: {
      agentId: selectedAgentId.value,
      prompt: taskPrompt.value,
      budgetCents: Math.round(budgetCap.value * 100)
    }
  })
  await navigateTo(`/tasks/${task?.id}`)
}
</script>

<template>
  <div class="flex flex-1 justify-center items-center bg-[#FFFFFF] rounded-md border border-[#D9D9D9]">
    <form @submit.prevent="createTask">
      <div class="flex flex-col px-2 py-2 rounded-md w-75 gap-y-4 bg-[#FFFFFF]">
        <span class="font-sans text-md font-medium text-[#121212]">Create a task</span>

        <!-- Agent selector -->
        <div class="flex flex-col gap-y-1 items-start w-full">
          <label class="font-sans text-xs text-[#555555] leading-3 font-medium">Assign to agent</label>
          <select
            v-model="selectedAgentId"
            required
            class="border border-[#D9D9D9] outline-0 rounded-sm w-full h-6 px-0.5 py-0.5 font-sans text-xs font-medium bg-[#FFFFFF]"
          >
            <option value="" disabled>Select an agent</option>
            <option
              v-for="agent in agents"
              :key="agent.id"
              :value="agent.id"
            >
              {{ agent.name }}
            </option>
          </select>
        </div>

        <!-- Prompt -->
        <div class="flex flex-col gap-y-1 items-start w-full">
          <label class="font-sans text-xs text-[#555555] leading-3 font-medium">Task prompt</label>
          <textarea
            v-model="taskPrompt"
            required
            placeholder="Find the cheapest translation API supporting Swahili under $20/mo"
            class="border border-[#D9D9D9] outline-0 resize-none rounded-sm w-full h-20 px-0.5 py-0.5 font-sans text-xs font-medium"
          />
        </div>

        <!-- Budget cap -->
        <div class="flex flex-col gap-y-1 items-start w-full">
          <label class="font-sans text-xs text-[#555555] leading-3 font-medium">Budget cap</label>
          <input
            type="number"
            step="0.01"
            required
            v-model="budgetCap"
            placeholder="$10.00"
            class="border border-[#D9D9D9] outline-0 rounded-sm w-full h-6 px-0.5 py-0.5 font-sans text-xs font-medium"
          />
        </div>

        <button class="flex justify-center items-center w-full border bg-[#121212] py-1 px-1 rounded-sm">
          <span class="text-sm font-sans font-medium text-[#FFFFFF]">Create task</span>
        </button>
      </div>
    </form>
  </div>
</template>