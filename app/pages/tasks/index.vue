<script setup lang="ts">
import { Plus } from "@lucide/vue";

useSeoMeta({
  title: "Act | Tasks"
})
definePageMeta({
  layout: "actlayout",
  middleware: ["auth"],
})

const { data: tasks_list, refresh } = await useFetch('/api/tasks')

const activeTasks = computed(() =>
  (tasks_list.value ?? []).filter((t: any) =>
    t.status === 'running' || t.status === 'stepup_pending' || t.status === 'queued'
  )
)

const completedTasks = computed(() =>
  (tasks_list.value ?? []).filter((t: any) =>
    t.status === 'completed' || t.status === 'failed'
  )
)
</script>

<template>
  <div class="flex flex-1 flex-col gap-y-1.5 overflow-y-scroll min-h-0 p-1">

    <!-- Active tasks -->
    <section class="flex flex-col gap-y-1.5 rounded-md border border-[#D9D9D9] bg-[#FFFFFF] w-full px-1 py-1">
      <div class="flex justify-between w-full items-center">
        <div class="flex items-center gap-x-2">
          <span class="font-sans text-sm font-medium">Active tasks</span>
          <span class="font-mono text-xs text-[#555555]">{{ activeTasks.length }}</span>
        </div>
        <NuxtLink
          to="/tasks/new"
          class="flex bg-[#121212] gap-x-1 p-1 pr-2.5 justify-center items-center rounded-sm no-underline"
        >
          <Plus :size="14" color="#FFFFFF" stroke-width="1" />
          <span class="font-sans text-xs text-[#FFFFFF]">Add Task</span>
        </NuxtLink>
      </div>
      <div
        v-if="activeTasks.length > 0"
        class="flex flex-col border-t border-[#D9D9D9]"
      >
        <TaskCard
          v-for="task in activeTasks"
          :key="task.id"
          :task="task"
        />
      </div>
      <div v-else class="flex justify-center items-center py-6 border-t border-[#D9D9D9]">
        <span class="font-sans text-xs text-[#555555]">No active tasks</span>
      </div>
    </section>

    <!-- Completed / failed tasks -->
    <section class="flex flex-col gap-y-1.5 rounded-md border border-[#D9D9D9] bg-[#FFFFFF] w-full px-1 py-1">
      <div class="flex items-center gap-x-2">
        <span class="font-sans text-sm font-medium">Completed tasks</span>
        <span class="font-mono text-xs text-[#555555]">{{ completedTasks.length }}</span>
      </div>
      <div
        v-if="completedTasks.length > 0"
        class="flex flex-col border-t border-[#D9D9D9]"
      >
        <TaskCard
          v-for="task in completedTasks"
          :key="task.id"
          :task="task"
        />
      </div>
      <div v-else class="flex justify-center items-center py-6 border-t border-[#D9D9D9]">
        <span class="font-sans text-xs text-[#555555]">No completed tasks yet</span>
      </div>
    </section>

  </div>
</template>