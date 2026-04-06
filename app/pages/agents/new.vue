<script setup lang="ts">
definePageMeta({
  layout: "actlayout",
  middleware: ["auth"]
})

useSeoMeta({
  title: "Act | Create Agent"
})

const availableScopes = [
  {tagName: 'read', tagDesc: "Agent will only be able to read information"},
  {tagName: 'write', tagDesc: "Agent will be able to perform actions for the user"},
  {tagName: 'purchase', tagDesc: "Agent will be able to make purchases for user"},
  {tagName: 'create', tagDesc: "Agent will be able to create subagents for tasks"},
  {tagName: 'team', tagDesc: "Agent will be able to team with other agents"}
]
// Create gives the agent the power to create a subagent to perform a task
// We can add 'collaborate' or 'team' for agents to be given the power to work with other agents to be given a task
const selectedScopes = ref<string[]>([])

function toggleScope(scope: string) {
  if (selectedScopes.value.includes(scope)) {
    selectedScopes.value = selectedScopes.value.filter(s => s !== scope)
  } else {
    selectedScopes.value = [...selectedScopes.value, scope]
  }
}

var agentName = ref("");
var agentDescription = ref("")
var budgetCap = ref<number>(1.00)

async function createAgent() {
  // e.preventDefault();
  // 
  console.log(agentName.value)
  const agent = $fetch(`/api/agents`, {
    method: 'POST',
    header: {
      "Content-Type": "application/json"
    },
    body: {
      agentName: agentName.value,
      description: agentDescription.value,
      budgetCents: Math.round(budgetCap.value * 100),
      scopes: selectedScopes.value
    }
  })
  
  // await navigateTo(`/agents/${agent.id}`)
  // await navigateTo(`/agents`)
}


</script>

<template>
  <div class="flex flex-1 justify-center items-center bg-[#FFFFFF] rounded-md border border-[#D9D9D9]">
    <!-- A form here for creating new agents -->
    <form @submit.prevent="createAgent">
      <div class="flex flex-col px-2 py-2 rounded-md w-75 gap-y-4  bg-[#FFFFFF]">
        <span class="font-sans text-md font-medium text-[#121212]">Create your agent</span>
        <div class="flex flex-col gap-y-1 items-start w-full">
          <label class="font-sans text-xs text-[#555555] leading-3 font-medium">Agent name</label>
          <input type="text" v-model="agentName" class="border border-[#D9D9D9] outline-0 rounded-sm w-full h-6 px-0.5 py-0.5 font-sans text-xs font-medium" placeholder="Email agent" />
        </div>
        <div class="flex flex-col gap-y-1 items-start w-full">
          <label class="font-sans text-xs text-[#555555] leading-3 font-medium">Agent description</label>
          <textarea class="border border-[#D9D9D9] outline-0 resize-none rounded-sm w-full h-6 px-0.5 py-0.5 font-sans text-xs font-medium" v-model="agentDescription"></textarea>
        </div>
        <div class="flex flex-col gap-y-1 items-start w-full">
          <label class="font-sans text-xs text-[#555555] leading-3 font-medium">Budget Cap</label>
          <input type="number" step="0.01" class="border border-[#D9D9D9] outline-0 rounded-sm w-full h-6 px-0.5 py-0.5 font-sans text-xs font-medium" placeholder="$100" v-model="budgetCap" />
        </div>
        <div class="flex flex-col gap-y-1">
          <label class="font-sans text-xs text-[#555555] leading-3 font-medium">Add scopes</label>
          <div class="flex gap-x-2 overflow-hidden overflow-x-scroll w-full noscrollbar">
            <button
              v-for="scope in availableScopes"
              :title="scope.tagDesc"
              :key="scope.tagName"
              type="button"
              @click="toggleScope(scope.tagName)"
              :class="[
                'px-3 py-1 rounded-sm font-sans text-xs transition-all duration-150 border',
                selectedScopes.includes(scope.tagName)
                  ? 'bg-[#121212] text-[#FFFFFF] border-[#121212]'
                  : 'bg-[#FFFFFF] text-[#555555] border-[#D9D9D9]'
              ]"
            >
              {{ scope.tagName }}
            </button>
          </div>
        </div>
        <!-- @click="createAgent" -->
        <button class="flex justify-center items-center w-full border bg-[#121212] py-1 px-1 rounded-sm">
          <span class="text-sm font-sans font-medium text-[#FFFFFF]">Create agent</span>
        </button>
      </div>
    </form>
  </div>
</template>