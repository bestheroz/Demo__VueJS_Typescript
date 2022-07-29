<template>
  <div class="w-full">
    <v-card-title> TextEditor.vue </v-card-title>
    <v-card-text>
      <TextEditor v-model="textHtml" min-height="60vh" />
    </v-card-text>
    <v-card-title class="text-h2"> v-model="value" </v-card-title>
    <v-card-text v-text="textHtml" />
  </div>
</template>

<script setup lang="ts">
import TextEditor from "@/components/texteditor/TextEditor.vue";
import { ref } from "vue";

const textHtml = ref("텍스트에디터 테스트");
</script>
