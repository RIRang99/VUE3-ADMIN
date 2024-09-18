<template>
  <div class="container">
    <input
      type="file"
      :accept="props.acceptType"
      :value="props.file"
      @change="onChangeFile"
      :multiple="props.multiple"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
const props = defineProps({
  acceptType: {
    type: String,
    default: "image/*"
  },
  file: {
    type: String,
    default: ""
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const fileList = ref<FileList | null>(null);

const onChangeFile = (e: Event) => {
  console.log(e, "e");

  const target = e.target as HTMLInputElement;
  const files = target.files;
  fileList.value = files;
  console.log(fileList.value, "上传文件列表");
  // 上传文件
};
</script>

<style lang="scss" scoped></style>
