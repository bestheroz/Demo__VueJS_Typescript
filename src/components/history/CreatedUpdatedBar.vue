<template>
  <div>
    <div class="text-right mr-4 text--secondary" style="opacity: 0.7">
      <span v-if="createdDateTimeString">
        Created by
        {{ getAdminNm(createdBy) }}
        <v-icon size="1rem" style="vertical-align: initial" class="ml-1">
          mdi-clock-outline
        </v-icon>
        {{ createdDateTimeString }}
      </span>
      <span
        v-if="createdDateTimeString && updatedDateTimeString"
        class="px-2 grey--text text--darken-1"
        >|</span
      >
      <span v-if="updatedDateTimeString">
        Updated by
        {{ getAdminNm(updatedBy) }}
        <v-icon size="1rem" style="vertical-align: initial" class="ml-1">
          mdi-clock-check-outline
        </v-icon>
        {{ updatedDateTimeString }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDatetime, getAdminNm } from "@/utils/formatter";
import { computed } from "vue";
import type { DateTime } from "@/definitions/types";

const props = defineProps<{
  createdBy?: number;
  createdDateTime?: DateTime;
  updatedBy?: number;
  updatedDateTime?: DateTime;
}>();

const createdDateTimeString = computed((): string => {
  if (!props.createdDateTime) {
    return "";
  }
  return formatDatetime(props.createdDateTime);
});

const updatedDateTimeString = computed((): string => {
  if (!props.updatedDateTime) {
    return "";
  }
  return formatDatetime(props.updatedDateTime);
});
</script>
