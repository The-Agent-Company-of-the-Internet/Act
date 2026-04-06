<script setup lang="ts">
useSeoMeta({
  title: "Act | Home"
})

definePageMeta({
  layout: "actlayout",
  middleware: ["auth"]
})

</script>

<template>
  <div class="flex flex-1 flex-col gap-y-1 overflow-y-scroll h-full min-h-0 w-full"> 
    <!-- Top Bento section -->
    <section class="flex gap-x-1 items-center w-full h-50"> 
      <!-- Will contain 3 bentos for the agents, either use component (external) or internal works out just fine -->
      <div class="flex px-1 py-1 h-50 w-1/2 border border-[#D9D9D9] bg-[#FFFFFF] rounded-md">
        <span class="font-sans text-sm text-[#121212]">Main agent</span>
      </div> 
      <!-- Will contain the two other bentos in a column manner -->
      <div class="flex flex-col gap-y-1 h-50 w-1/2">
        <div class="flex px-1 py-1 h-1/2 w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-md">
          
        </div>
        <div class="flex px-1 py-1 h-1/2 w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-md">
          
        </div>
      </div> 
    </section> 
    <!-- Total agents and tasks currently running or ran? -->
     <section class="flex gap-x-1 w-full h-60"> 
      <!-- The total agents with a graph of budget used over a period of time -->
      <div class="w-1/2 h-60 border border-[#D9D9D9] bg-[#FFFFFF] rounded-md px-1 py-1 flex flex-col">
        <section class="flex w-full items-start justify-between">
          <div class="flex flex-col gap-y-0">
            <span class="font-sans text-lg text-[#121212] font-medium">Total agents</span>
            <span class="font-sans text-xs text-[#555555]">Budget used over 7 days</span>
          </div>
          <div class="flex items-end gap-x-px mt-1.5">
            <span class="font-sans text-2xl text-[#121212] leading-4.5 font-medium">0</span>
            <span class="font-sans text-sm text-[#555555] leading-2.5 font-medium">agents</span>
          </div>
        </section>
      </div>
      <div class="flex flex-col gap-y-1 w-1/2 h-60">
        <div class="flex px-1 py-1 h-fit w-full bg-[#FFFFFF] border border-[#D9D9D9] items-start rounded-md justify-between">
          <span class="font-sans text-md font-medium">Pending step-up auth</span>
          <div class="flex items-end gap-x-px mt-1">
            <span class="font-sans text-2xl text-[#121212] leading-4.5 font-medium">10</span>
            <span class="font-sans text-sm text-[#555555] leading-2.5 font-medium">agents</span>
          </div>
        </div>
        <div class="flex flex-col gap-y-1 px-1 py-1 h-full w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-md">
          <span class="font-sans text-sm font-medium">Running tasks</span>
          <div class="flex flex-col w-full h-full">
            <div class="flex justify-center items-center h-full w-full">
              <span class="font-sans text-xs text-[#555555]">There are no tasks running currently</span>
            </div>
          </div>
        </div>
      </div> 
    </section> 
    <!-- Recent tasks activity which is actually large and scrollable -->
    <section class="h-60 border border-[#D9D9D9] rounded-md flex flex-col w-full bg-[#FFFFFF]">
    </section> 
  </div> 
</template>
