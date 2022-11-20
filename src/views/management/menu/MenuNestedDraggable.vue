<template>
  <v-list
    class="pt-0 mb-1 sortableListItem"
    :class="`${!rootFlag ? 'ml-5' : ''} ${className}`"
  >
    <v-list-item
      v-for="_menu in value"
      :key="_menu.id"
      dense
      class="pr-0"
      :data-value="JSON.stringify({ ..._menu, children: [] })"
    >
      <v-list-item-icon
        v-if="_menu.type === MENU_TYPE.GROUP"
        :class="{ 'pt-1': hasWriteAuthority }"
      >
        <v-icon v-text="_menu.icon" />
      </v-list-item-icon>
      <v-list-item-title class="d-inline pt-1">
        <v-btn v-if="hasWriteAuthority" icon>
          <v-icon class="drag-handle"> mdi-sort </v-icon>
        </v-btn>
        <a
          class="text--anchor"
          @click="emits('click:edit', _menu)"
          v-text="_menu.name"
        />
        {{ _menu.url ? `(${_menu.url})` : "" }}
        <v-btn
          v-if="hasDeleteAuthority"
          icon
          small
          @click="emits('click:delete', _menu)"
        >
          <v-icon color="error"> mdi-delete-outline </v-icon>
        </v-btn>
        <MenuNestedDraggable
          v-if="_menu.type === MENU_TYPE.GROUP"
          v-model="_menu.children"
          :parent-id="_menu.id"
          @click:edit="(item) => emits('click:edit', item)"
          @click:delete="(item) => emits('click:delete', item)"
          @completed-load="onCompletedLoad"
        />
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>
<script setup lang="ts">
import type { Menu } from "@/definitions/models";
import { MENU_TYPE } from "@/definitions/selections";
import { tryOnMounted, useDebounceFn, useVModel } from "@vueuse/core";
import { useAuthorityStore } from "@/stores/authority";
import Sortable from "sortablejs";
import { computed, nextTick } from "vue";

const { hasWriteAuthority, hasDeleteAuthority } = useAuthorityStore();

const props = withDefaults(defineProps<{ value: Menu[]; parentId: number }>(), {
  value: () => [],
});
const emits = defineEmits<{
  (e: "input", v: Menu[]): void;
  (e: "click:edit", v: Menu): void;
  (e: "click:delete", v: Menu): void;
  (e: "completed-load");
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });

const rootFlag = computed(() => props.parentId === 0);
const className = computed(() => `sortableListItem-${props.parentId}`);

const createSortable = useDebounceFn(() => {
  const querySelectors =
    document.querySelectorAll<HTMLElement>(".sortableListItem");
  for (let i = 0; i < querySelectors.length; i++) {
    Sortable.create(querySelectors[i], {
      group: "nested",
      handle: ".drag-handle",
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      onEnd() {
        value.value = extractSortableData(0);
      },
    });
  }
}, 500);

function extractSortableData(parentMenuId) {
  const querySelectors = document.querySelectorAll<HTMLElement>(
    `.sortableListItem-${parentMenuId}>.v-list-item`,
  );
  const result: Menu[] = [];
  for (let i = 0; i < querySelectors.length; i++) {
    const attribute = querySelectors[i].getAttribute("data-value");
    if (attribute) {
      const menu = JSON.parse(attribute) as Menu;
      result.push({
        ...menu,
        children:
          menu.type === MENU_TYPE.GROUP ? extractSortableData(menu.id) : [],
      });
    }
  }
  return result;
}

function onCompletedLoad() {
  if (rootFlag.value) {
    createSortable();
  } else {
    emits("completed-load");
  }
}

tryOnMounted(async () => {
  await nextTick();
  if (rootFlag.value) {
    createSortable();
  } else {
    emits("completed-load");
  }
});
</script>
