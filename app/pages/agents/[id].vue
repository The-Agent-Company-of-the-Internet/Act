<script setup lang="ts">
useSeoMeta({
  title: "Act | Agents"
})

definePageMeta({
  layout: "actlayout",
  middleware: ["auth"],
})
</script>

<template>
  <div>Hello to your agent</div>
</template>