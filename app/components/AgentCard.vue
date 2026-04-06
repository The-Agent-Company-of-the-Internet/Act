<script setup lang="ts">
import { SquareArrowOutUpRight } from '@lucide/vue';

const props = defineProps({
  agentName: {
    type: String,
    default: "Agent",
    required: true
  },
  status: {
    type: String,
    default: "Idle",
    required: true
  },
  description: {
    type: String,
    default: "An agent",
    required: true
  },
  scopes: {
    type: Array<String>,
    default: ["read", "write", "purchase"],
    required: true
  },
  budget: {
    type: Number,
    default: 1.25,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  }
})

// const _props = defineProps<{}>()

</script>

<template>
  <div class="border border-[#D9D9D9] rounded-md bg-[#FFFFFF] w-full h-10 px-3 py-1 flex items-center justify-between"> 
    <span class="font-sans text-sm">{{ props.agentName }}</span>
    <span class="font-sans text-sm">{{ props.status }}</span>
    <span class="font-sans text-sm">{{ props.description }}</span>
    <span class="font-sans text-sm">{{ props.scopes }}</span>
    <span class="font-sans text-sm">{{ props.budget }}</span>
    <span class="font-sans text-sm">{{ props.timestamp }}</span>
     <NuxtLink to="/agents/" class="no-underline">
       <SquareArrowOutUpRight :size="14" color="#121212" stroke-width="1" />
    </NuxtLink>
  </div>  
</template>