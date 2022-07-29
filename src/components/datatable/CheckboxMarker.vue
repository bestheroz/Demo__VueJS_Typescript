<template>
  <div>
    <v-icon v-if="value" color="primary"> mdi-check-circle </v-icon>
    <v-icon v-else color="secondary"> mdi-circle-outline</v-icon>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: boolean;
}>();
</script>
