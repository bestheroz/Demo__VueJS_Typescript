<template>
  <div>
    <v-card-title class="text-h4 py-1 pl-4 text--secondary">
      {{ title }}
      <v-spacer />
      <v-switch class="d-none" />
      <v-switch
        v-if="withSwitch"
        v-model="value"
        :label="getSwitchLabel(value, switchText)"
        inset
        color="primary"
        :disabled="disabledSwitch || !hasWriteAuthority"
        class="pr-4"
      />
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            tile
            icon
            fab
            v-bind="attrs"
            @click="emits('click:close')"
            v-on="on"
          >
            <v-icon large v-text="'mdi-window-close'" />
          </v-btn>
        </template>
        <span v-text="'닫기'" />
      </v-tooltip>
    </v-card-title>
  </div>
</template>

<script setup lang="ts">
import { getSwitchLabel } from "@/utils/formatter";
import { computed } from "vue";
import { useVModel } from "@vueuse/core";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority } = useAuthorityStore();

const props = defineProps<{
  value?: boolean;
  withSwitch?: boolean;
  switchText?: string[];
  disabledSwitch?: boolean;
  prefix?: string;
  text?: string;
  isNew?: boolean;
  suffix?: string;
}>();

const emits = defineEmits<{
  (e: "input", v: boolean): void;
  (e: "click:close"): void;
}>();

const value = useVModel(props, "value", emits, { eventName: "input" });

const title = computed((): string => {
  if (props.text) {
    return props.text;
  } else if (props.prefix) {
    return `${props.prefix} ${
      props.suffix
        ? props.suffix
        : hasWriteAuthority
        ? props.isNew
          ? "등록"
          : "수정"
        : "보기"
    } `;
  } else {
    return "";
  }
});
</script>
