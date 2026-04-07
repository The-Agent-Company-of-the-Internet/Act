<script setup lang="ts">
import { onMounted } from "vue";
import { Plus } from "@lucide/vue";

useSeoMeta({
  title: "Act | Agents"
})

definePageMeta({
  layout: "actlayout",
  middleware: ["auth"]
})

async function getAgents() {
  const agents_list = await $fetch(`/api/agents`, {
    method: 'GET',
  })
  
  return agents_list
}

const agent_list = ref<[]>([]);


onMounted(async () => {
  console.log("Agent list first is: ", agent_list.value)
  agent_list.value = await getAgents();
  
  console.log("Agent list value is: ", agent_list.value)
})


</script>
<template>
   <main class="flex flex-1 flex-col gap-y-2"> 
    <!-- Top Bento section -->
    <section class="flex gap-x-1 items-center w-full h-fit"> 
      <!-- Will contain 3 bentos for the agents, either use component (external) or internal works out just fine -->
       <div class="flex px-1 py-1 h-50 flex-1 border border-[#D9D9D9] bg-[#FFFFFF] rounded-md">
        <span class="font-sans text-sm text-[#121212]">Main agent</span>
      </div> 
      <!-- Will contain the two other bentos in a column manner -->
       <div class="flex flex-col gap-y-1 h-50 flex-1">
        <div class="flex px-1 py-1 h-1/2 w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-md">
          
        </div>
        <div class="flex px-1 py-1 h-1/2 w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-md">
          
        </div>
      </div> 
    </section> 
    <!-- This section showcases the cards for the agents -->
    <section class="flex flex-col flex-1 w-full gap-y-1">
      <div class="flex w-full items-center justify-between">
        <span class="font-sans text-sm">Agents</span>
        <NuxtLink to="/agents/new" class="flex bg-[#121212] gap-x-1 p-1 pr-2.5 justify-center items-center rounded-sm">
          <Plus :size="14" color="#FFFFFF" stroke-width="1" />
          <span class="font-sans text-xs text-[#FFFFFF]">Add agent</span>
        </NuxtLink>
      </div>
      <div class="overflow-y-scroll gap-y-1 py-1 flex flex-col bg-[#FFFFFF] rounded-md h-full w-full" v-if="agent_list.length > 1">
        <AgentCard
          v-for="agent in agent_list"
          :key="agent.id"
          :agent="agent"
        />
      </div>
      <div class="overflow-hidden py-1 flex justify-center items-center h-full w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-md" v-else>
        <span class="font-sans text-sm text-[#555555] font-medium">You have no agents created</span>
      </div>
    </section> 
  </main> 
</template>