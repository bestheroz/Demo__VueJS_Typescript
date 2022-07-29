<template>
  <div>
    <v-tooltip
      :bottom="bottom || defaultPosition"
      :top="top"
      :left="left"
      :right="right"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          :color="color"
          @click="$emit('click')"
          v-bind="attrs"
          v-on="on"
          :disabled="disabled"
          :loading="loading"
          :small="small"
          :x-small="xSmall"
          :large="large"
          :x-large="xLarge"
          :block="block"
          :class="className"
        >
          <v-icon
            v-text="icon"
            :size="size"
            :small="small"
            :x-small="xSmall"
            :large="large"
            :x-large="xLarge"
          />
        </v-btn>
      </template>
      <span v-text="text" />
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    icon: string;
    text: string;
    color?: string;
    disabled?: boolean;
    loading?: boolean;
    bottom?: boolean;
    left?: boolean;
    top?: boolean;
    right?: boolean;
    small?: boolean;
    xSmall?: boolean;
    large?: boolean;
    xLarge?: boolean;
    block?: boolean;
    className?: string;
    size?: string | number;
  }>(),
  { color: "primary", className: undefined, size: undefined },
);

const defaultPosition = computed(
  (): boolean => !props.top && !props.bottom && !props.right && !props.left,
);
</script>
