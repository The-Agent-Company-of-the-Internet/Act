<script setup lang="ts">
import { SquareArrowOutUpRight } from '@lucide/vue';

const props = defineProps<{
  task: {
    id: string
    prompt: string
    status: string
    budgetCents: number
    spentCents: number
    agentName: string
    createdAt: string
  }
}>()

const statusStyles: Record<string, string> = {
  queued: 'text-[#555555] border-[#D9D9D9]',
  running: 'text-[#121212] border-[#121212]',
  stepup_pending: 'text-[#F0A347] border-[#F0A347]',
  completed: 'text-[#2ECC8A] border-[#2ECC8A]',
  failed: 'text-[#F05C5C] border-[#F05C5C]',
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex justify-between py-1.5 px-2 items-center w-full border border-l-0 border-r-0 border-t-0 border-b border-b-[#D9D9D9]">
    <div class="flex gap-x-3 items-center flex-1 min-w-0">
      <!-- task id -->
      <span class="font-mono text-xs text-[#555555] shrink-0">{{ task.id.slice(0, 18) }}...</span>
      <!-- prompt truncated -->
      <span class="font-sans text-xs text-[#121212] truncate max-w-60">{{ task.prompt }}</span>
      <!-- agent name -->
      <span class="font-sans text-xs text-[#555555] shrink-0">{{ task.agentName }}</span>
    </div>
    <div class="flex items-center gap-x-3 shrink-0">
      <!-- budget -->
      <span class="font-mono text-xs text-[#555555]">
        ${{ (Number(task.spentCents) / 100).toFixed(2) }} / ${{ (Number(task.budgetCents) / 100).toFixed(2) }}
      </span>
      <!-- date -->
      <span class="font-sans text-xs text-[#555555]">{{ formatDate(task.createdAt) }}</span>
      <!-- status pill -->
      <span :class="['font-mono text-xs border px-2 py-0.5 rounded-sm shrink-0', statusStyles[task.status] ?? statusStyles.queued]">
        {{ task.status }}
      </span>
      <!-- link -->
      <NuxtLink :to="`/tasks/${task.id}`" class="no-underline">
        <SquareArrowOutUpRight :size="14" color="#121212" stroke-width="1" />
      </NuxtLink>
    </div>
  </div>
</template>