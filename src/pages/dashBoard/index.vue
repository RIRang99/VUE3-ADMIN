<template>
  <p>当前鼠标位置:</p>
  <p>x坐标:{{ x }}</p>
  <p>y坐标:{{ y }}</p>
  <div class="p-1 bg-red-400">测试tailwind</div>
</template>

<script setup lang="ts">
import { useMouse } from "@vueuse/core";
const { x, y } = useMouse();
</script>

<style lang="scss" scoped></style>
