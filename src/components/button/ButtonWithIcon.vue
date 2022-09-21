<template>
  <div>
    <v-btn
      :color="color"
      :disabled="disabled"
      :loading="loading"
      :small="small"
      :x-small="xSmall"
      :large="large"
      :x-large="xLarge"
      :block="block"
      @click="$emit('click')"
    >
      <v-icon class="mr-1" v-text="icon" />
      {{ text }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    text: string;
    color?: string;
    disabled?: boolean;
    loading?: boolean;
    small?: boolean;
    xSmall?: boolean;
    large?: boolean;
    xLarge?: boolean;
    block?: boolean;
  }>(),
  { color: "primary" },
);
</script>
