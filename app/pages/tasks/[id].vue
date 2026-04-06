<script setup lang="ts">
useSeoMeta({
  title: "Act | Tasks"
})

definePageMeta({
  layout: "actlayout",
  middleware: ["auth"]
})

const route = useRoute()
const taskId = route.params.id as string

const { data: task } = await useFetch(`/api/tasks/${taskId}`, {
  method: "GET"
})

// logs start from whatever is already in DB
const logs = ref<any[]>(task.value?.logs ?? [])
const status = ref(task.value?.status ?? 'queued')
const logContainer = ref<HTMLElement | null>(null)

const statusColors: Record<string, string> = {
  queued: 'text-[#555555] border-[#D9D9D9]',
  running: 'text-[#121212] border-[#121212]',
  stepup_pending: 'text-[#F0A347] border-[#F0A347]',
  completed: 'text-[#2ECC8A] border-[#2ECC8A]',
  failed: 'text-[#F05C5C] border-[#F05C5C]',
}

const badgeColors: Record<string, string> = {
  orchestrator: 'bg-[#121212] text-[#FFFFFF]',
  researcher: 'bg-[#E8F5E9] text-[#2E7D32]',
  comparator: 'bg-[#E3F2FD] text-[#1565C0]',
  purchaser: 'bg-[#FFF3E0] text-[#E65100]',
}

// auto scroll to bottom on new logs
watch(logs, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}, { deep: true })

onMounted(() => {
  const eventSource = new EventSource(`/api/tasks/${taskId}/stream`)

  eventSource.onmessage = (e) => {
    const data = JSON.parse(e.data)
    
    if (data.type === 'status') {
      status.value = data.status
      if (data.status === 'completed' || data.status === 'failed') {
        eventSource.close()
      }
      return
    }

    // it's a log entry
    logs.value.push(data)
    console.log("Log data: ", logs.value)
  }

  eventSource.onerror = () => {
    eventSource.close()
  }

  onUnmounted(() => {
    eventSource.close()
  })
})

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

const budgetPercent = computed(() => {
  if (!task.value) return 0
  console.log(task.value)
  const spent = Number(task.value.spentCents)
  const budget = Number(task.value.budgetCents)
  if (budget === 0) return 0
  return Math.round((spent / budget) * 100)
})
</script>

<template>
  <div class="flex flex-1 flex-col gap-y-2 overflow-y-scroll min-h-0 p-2">

    <!-- Header -->
    <div class="flex items-center justify-between bg-[#FFFFFF] border border-[#D9D9D9] rounded-md px-3 py-2">
      <div class="flex flex-col gap-y-0.5">
        <span class="font-mono text-xs text-[#555555]">{{ taskId }}</span>
        <span class="font-sans text-sm font-medium text-[#121212] max-w-xl">{{ task?.prompt }}</span>
      </div>
      <div class="flex items-center gap-x-3">
        <span class="font-sans text-xs text-[#555555]">{{ task?.agentName }}</span>
        <span :class="['font-mono text-xs border px-2 py-0.5 rounded-sm', statusColors[status] ?? statusColors.queued]">
          {{ status }}
        </span>
      </div>
    </div>

    <!-- Budget bar -->
    <div class="flex items-center gap-x-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-md px-3 py-2">
      <span class="font-sans text-xs text-[#555555] shrink-0">Budget</span>
      <div class="flex-1 h-1 bg-[#EDEDED] rounded-sm overflow-hidden">
        <div
          class="h-full bg-[#121212] rounded-sm transition-all duration-500"
          :style="{ width: `${budgetPercent}%` }"
        />
      </div>
      <span class="font-mono text-xs text-[#121212] shrink-0">
        ${{ ((task?.spentCents ?? 0) / 100).toFixed(2) }} / ${{ ((task?.budgetCents ?? 0) / 100).toFixed(2) }}
      </span>
    </div>

    <!-- Main content -->
    <div class="flex gap-x-2 flex-1 min-h-0">

      <!-- Log feed -->
      <div class="flex flex-col flex-1 bg-[#FFFFFF] border border-[#D9D9D9] rounded-md overflow-hidden">
        <div class="flex items-center justify-between px-3 py-2 border-b border-[#D9D9D9]">
          <span class="font-sans text-xs font-medium text-[#121212]">Live log</span>
          <div v-if="status === 'running'" class="flex items-center gap-x-1.5">
            <div class="w-1.5 h-1.5 rounded-full bg-[#2ECC8A] animate-pulse" />
            <span class="font-mono text-xs text-[#555555]">live</span>
          </div>
        </div>
        <div
          ref="logContainer"
          class="flex flex-col gap-y-2 flex-1 overflow-y-scroll p-3 min-h-0"
        >
          <div v-if="logs.length === 0" class="flex items-center justify-center h-full">
            <span class="font-sans text-xs text-[#555555]">
              {{ status === 'queued' ? 'Task is queued, waiting to run...' : 'No logs yet' }}
            </span>
          </div>
          <div
            v-for="(log, i) in logs"
            :key="i"
            class="flex items-start border border-l-0 border-r-0 border-t-0 border-b-[#D9D9D9] gap-x-2 pt-1 pb-1 font-mono text-xs hover:bg-[#D9D9D9] hover:border-t-[#121212] hover:border-b-[#121212]"
          >
            <span class="text-[#555555] shrink-0 mt-px">{{ formatTime(log.createdAt) }}</span>
            <span
              :class="['px-1.5 py-px rounded-xs text-xs shrink-0 mt-px', badgeColors[log.agentRole] ?? 'bg-[#EDEDED] text-[#121212]']"
            >
              {{ log.agentRole?.toUpperCase() }}
            </span>
            <span class="text-[#121212] leading-4">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <!-- Token delegation tree -->
      <div class="flex flex-col w-55 bg-[#FFFFFF] border border-[#D9D9D9] rounded-md overflow-hidden shrink-0">
        <div class="px-3 py-2 border-b border-[#D9D9D9]">
          <span class="font-sans text-xs font-medium text-[#121212]">Token delegation</span>
        </div>
        <div class="flex flex-col gap-y-2 p-3">
          <div class="flex items-center gap-x-2 px-2 py-1.5 bg-[#121212] rounded-sm">
            <span class="font-mono text-xs text-[#FFFFFF]">ORCH</span>
            <span class="font-sans text-xs text-[#FFFFFF]">Orchestrator</span>
          </div>
          <div class="flex flex-col gap-y-1 pl-3 border-l border-dashed border-[#D9D9D9]">
            <div
              v-for="role in ['researcher', 'comparator', 'purchaser']"
              :key="role"
              :class="[
                'flex items-center justify-between px-2 py-1.5 rounded-sm border',
                logs.some(l => l.agentRole === role)
                  ? 'border-[#121212] bg-[#EDEDED]'
                  : 'border-[#D9D9D9] bg-[#FFFFFF]'
              ]"
            >
              <span class="font-mono text-xs text-[#121212] uppercase">{{ role.slice(0, 3) }}</span>
              <span class="font-sans text-xs text-[#555555]">{{ role }}</span>
              <span
                :class="[
                  'font-mono text-xs',
                  logs.some(l => l.agentRole === role) ? 'text-[#121212]' : 'text-[#D9D9D9]'
                ]"
              >
                {{ logs.some(l => l.agentRole === role) ? 'active' : 'idle' }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Step-up auth banner -->
    <div
      v-if="status === 'stepup_pending'"
      class="flex items-center justify-between bg-[#FFFFFF] border border-[#F0A347] rounded-md px-3 py-2"
    >
      <div class="flex flex-col gap-y-0.5">
        <span class="font-sans text-sm font-medium text-[#121212]">Step-up authorization required</span>
        <span class="font-sans text-xs text-[#555555]">Agent wants to make a payment. Approve or deny to continue.</span>
      </div>
      <div class="flex gap-x-2">
        <button
          class="font-sans text-xs px-3 py-1 rounded-sm bg-[#121212] text-[#FFFFFF]"
          @click="$fetch(`/api/tasks/${taskId}/stepup/approve`, { method: 'POST' }).then(() => status = 'running')"
        >
          Approve
        </button>
        <button
          class="font-sans text-xs px-3 py-1 rounded-sm border border-[#F05C5C] text-[#F05C5C]"
          @click="$fetch(`/api/tasks/${taskId}/stepup/deny`, { method: 'POST' }).then(() => status = 'failed')"
        >
          Deny
        </button>
      </div>
    </div>

  </div>
</template>