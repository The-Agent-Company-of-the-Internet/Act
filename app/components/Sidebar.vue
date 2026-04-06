<script setup lang="ts">
import { 
  LayoutGrid, Blocks,
  LayoutList, Shield,
  ArrowRight, LogOut
} from "@lucide/vue";

const user = useUser();

const user_value = user.value;

</script>


<template>
   <aside class="relative flex flex-col bg-[#FFFFFF] gap-y-3 justify-between rounded-md w-0 sm:w-45 border border-[#D9D9D9] p-2">
    <section class="flex w-full justify-left items-center">
      <div class="flex justify-center items-center gap-x-2">
        <div class="flex"><DarkLogo /></div>
        <span class="font-sans text-md text-[#121212] font-medium">Act agents</span>
      </div>
    </section>
    <section class="flex flex-1 flex-col gap-y-1">
      <NuxtLink to="/home" class="flex gap-x-1.5 no-underline items-center justify-left px-1 py-1 rounded-sm w-full" exact-active-class="bg-[#121212]">
        <template #default="{ isExactActive }">
          <LayoutGrid :size="14" :color="isExactActive ? 'white' : '#121212'" :stroke-width="0.5" />
          <span :class="['font-sans text-xs', isExactActive ? 'text-white' : 'text-[#121212]']">Home</span>
        </template>
      </NuxtLink>
      
      <NuxtLink to="/agents" class="flex gap-x-1.5 no-underline items-center justify-left px-1 py-1 rounded-sm w-full" active-class="bg-[#121212]">
        <template #default="{ isActive }">
          <Blocks :size="14" :color="isActive ? 'white' : '#121212'" :stroke-width="0.5" />
          <span :class="['font-sans text-xs', isActive ? 'text-white' : 'text-[#121212]']">Agents</span>
        </template>
      </NuxtLink>
      
      <NuxtLink to="/tasks" class="flex gap-x-1.5 no-underline items-center justify-left px-1 py-1 rounded-sm w-full" active-class="bg-[#121212]">
        <template #default="{ isActive }">
          <LayoutList :size="14" :color="isActive ? 'white' : '#121212'" :stroke-width="0.5" />
          <span :class="['font-sans text-xs', isActive ? 'text-white' : 'text-[#121212]']">Tasks</span>
        </template>
      </NuxtLink>
      
      <NuxtLink to="/audit" class="flex gap-x-1.5 no-underline items-center justify-left px-1 py-1 rounded-sm w-full" exact-active-class="bg-[#121212]">
        <template #default="{ isExactActive }">
          <Shield :size="14" :color="isExactActive ? 'white' : '#121212'" :stroke-width="0.5" />
          <span :class="['font-sans text-xs', isExactActive ? 'text-white' : 'text-[#121212]']">Audit</span>
        </template>
      </NuxtLink>
    </section>
    <section class="flex flex-col gap-y-2">
      <div class="flex flex-col gap-y-2.5 border border-[#D9D9D9] bg-[#EDEDED] rounded-sm w-full px-1 py-1">
        <div class="flex w-full justify-between items-center">
          <span class="font-sans text-xs font-medium text-[#121212]">Budget</span>
          <span class="font-sans text-xs font-medium text-[#121212]">50%</span>
        </div>
        <div class="flex flex-col gap-y-1 w-full justify-start items-center">
          <div class="flex w-full border h-0.75 bg-[#121212] rounded-sm"></div>
          <div class="flex gap-x-0.75 items-end justify-start w-full">
            <span class="font-sans text-xs font-medium text-[#121212]">$40.00</span>
            <span class="font-sans text-xs font-medium text-[#555555]">of $160.99 used</span>
          </div>
        </div>
        <button class="flex gap-x-1 justify-center items-center w-full py-1 rounded-sm bg-[#121212]">
          <span class="font-sans text-xs font-normal text-[#FFFFFF]">Add budget</span>
          <ArrowRight :size="14" color="#FFFFFF" :stroke-width="1" />
        </button>
      </div>
      <div class="flex gap-x-2 justify-between items-center border border-[#D9D9D9] px-1 py-1 rounded-sm bg-[#EDEDED]">
        <div class="flex items-center justify-start gap-x-2">
          <div class="h-8 w-8 flex justify-center items-center rounded-xs bg-[#FFFFFF] border border-[#D9D9D9]">
            <NuxtImg :src="user_value?.picture" width="32" height="32" alt="Profile picture" class="rounded-xs" />
          </div>
          <span class="font-sans text-sm font-medium text-[#121212]">{{ user_value?.given_name }}</span>
        </div>
        <a href="/auth/logout" class="flex items-center justify-center border border-[#D9D9D9] w-7 h-7 rounded-xs">
          <LogOut :size="15" color="#555555" :stroke-width="1" />
        </a>
      </div>
    </section>
  </aside> 
</template>