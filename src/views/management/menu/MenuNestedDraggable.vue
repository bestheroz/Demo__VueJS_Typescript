<template>
  <v-list class="pt-0 mb-1" :class="{ 'ml-5': !rootFlag }">
    <vuedraggable
      class="dragArea"
      tag="div"
      :list="value"
      :group="{ name: 'g1' }"
      :animation="200"
      handle=".drag-handle"
      :scroll-sensitivity="200"
      :force-fallback="true"
      :style="`${value.length === 0 ? 'border-style: dotted' : ''}`"
    >
      <v-list-item dense :key="_menu.id" v-for="_menu in value" class="pr-0">
        <v-list-item-icon
          :class="{ 'pt-1': hasWriteAuthority }"
          v-if="_menu.type === MENU_TYPE.GROUP"
        >
          <v-icon v-text="_menu.icon" />
        </v-list-item-icon>
        <v-list-item-title class="d-inline pt-1">
          <v-btn icon v-if="hasWriteAuthority">
            <v-icon class="drag-handle"> mdi-sort </v-icon>
          </v-btn>
          <a
            class="text--anchor"
            @click="emits('click:edit', _menu)"
            v-text="_menu.name"
          />
          {{ _menu.url ? `(${_menu.url})` : "" }}
          <v-btn
            icon
            small
            @click="emits('click:delete', _menu)"
            v-if="hasDeleteAuthority"
          >
            <v-icon color="error"> mdi-delete-outline </v-icon>
          </v-btn>
          <component
            :is="MenuNestedDraggable"
            v-if="_menu.type === MENU_TYPE.GROUP"
            v-model="_menu.children"
            @click:edit="(item) => emits('click:edit', item)"
            @click:delete="(item) => emits('click:delete', item)"
          />
        </v-list-item-title>
      </v-list-item>
    </vuedraggable>
  </v-list>
</template>
<script setup lang="ts">
import { Menu } from "@/definitions/models";
import * as Vuedraggable from "vuedraggable";
import { MENU_TYPE } from "@/definitions/selections";
import { useVModel } from "@vueuse/core";
import MenuNestedDraggable from "@/views/management/menu/MenuNestedDraggable.vue";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority, hasDeleteAuthority } = useAuthorityStore();

const props = withDefaults(
  defineProps<{ value: Menu[]; rootFlag?: boolean }>(),
  {
    value: () => [],
  },
);
const emits = defineEmits<{
  (e: "input", v: Menu[]): void;
  (e: "click:edit", v: Menu): void;
  (e: "remove-role", v: Menu): void;
  (e: "click:delete", v: Menu): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
</script>
