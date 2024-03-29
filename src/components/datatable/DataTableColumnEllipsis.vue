<template>
  <div>
    <div
      :class="textEllipsisTargetId"
      :style="{
        'text-overflow': 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap',
        'word-break': 'break-all',
        cursor: 'help',
      }"
    >
      <v-tooltip
        v-if="value"
        v-model="show"
        top
        color="secondary"
        :max-width="tooltipWidth"
        open-on-click
        :open-on-hover="false"
      >
        <template #activator="{ on, attrs }">
          <div
            v-bind="attrs"
            :style="{
              'max-width': maxWidth + '!important',
              'text-overflow': 'ellipsis',
              overflow: 'hidden',
            }"
            v-on="on"
            @click="show = !show"
          >
            {{ value }}
          </div>
        </template>
        <div @click="show = !show">{{ value }}</div>
      </v-tooltip>
      <span v-else>{{ value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { uniqueId } from "lodash-es";
import { computed, ref } from "vue";
import { watchDebounced } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    value: string;
    width?: string | number;
    tooltipWidth?: string | number;
  }>(),
  { width: "25rem", tooltipWidth: "25rem" },
);

const show = ref(false);

const textEllipsisTargetId = uniqueId("text-ellipsis-target-");

function makeTextEllipsis() {
  Promise.resolve()
    .then(() => {
      document
        .querySelectorAll<HTMLElement>(textEllipsisTargetId)
        .forEach((item) => item.classList.remove("text-ellipsis"));
    })
    .then(() => {
      document
        .querySelectorAll<HTMLElement>(textEllipsisTargetId)
        .forEach((item) => {
          item.style.maxWidth = item.offsetWidth + "px";
          item.classList.add("text-ellipsis");
        });
    });
}

const maxWidth = computed((): string =>
  typeof props.width === "string" ? props.width : `${props.width}px`,
);

watchDebounced(
  () => props.value,
  () => {
    makeTextEllipsis();
  },
  { debounce: 100 },
);
</script>
<style lang="scss">
.v-application {
  table {
    td,
    th {
      white-space: nowrap;
    }
  }
  .v-tooltip__content {
    pointer-events: initial;
    span {
      white-space: pre-wrap !important;
      word-break: break-all;
    }
  }
}
</style>
