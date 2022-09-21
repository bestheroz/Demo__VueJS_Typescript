<template>
  <div :class="`pl-1 offset-${depth}`">
    <div
      v-for="menu in menus"
      :key="menu.id"
      :class="menu.type === MENU_TYPE.GROUP ? '' : 'd-inline-block'"
    >
      <v-chip
        v-if="menu.id"
        :value="menu.id"
        :outlined="!value.includes(menu.id)"
        :color="value.includes(menu.id) ? 'primary' : 'secondary'"
        class="px-4"
        label
        :disabled="disabled || !hasWriteAuthority"
      >
        <v-icon
          v-if="menu.type === MENU_TYPE.GROUP"
          class="pr-1"
          size="22"
          v-text="menu.icon"
        />
        {{ menu.name }}
      </v-chip>
      <component
        :is="RoleMenuMenuItem"
        v-model="value"
        :menus="menu.children"
        :depth="depth + 1"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MENU_TYPE } from "@/definitions/selections";
import { Menu } from "@/definitions/models";
import { useVModel } from "@vueuse/core";
import RoleMenuMenuItem from "@/views/management/role/menu/RoleMenuMenuItem.vue";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority } = useAuthorityStore();
const props = withDefaults(
  defineProps<{
    value: number[];
    menus: Menu[];
    depth?: number;
    disabled?: boolean;
  }>(),
  { depth: 0 },
);
const emits = defineEmits<{
  (e: "input", v: number[]): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
</script>
