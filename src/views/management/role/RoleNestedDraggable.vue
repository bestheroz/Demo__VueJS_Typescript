<template>
  <v-list
    class="pt-0 mb-1 sortableListItem"
    :class="`${!rootFlag ? 'ml-5' : ''} ${className}`"
  >
    <v-list-item
      v-for="role in value"
      :key="role.id"
      :class="role.id === 1 ? 'd-none' : undefined"
      dense
      class="pr-0"
      :data-value="JSON.stringify({ ...role, children: [] })"
    >
      <v-list-item-title v-if="role.id !== 1" class="d-inline pt-1">
        <div>
          <v-btn v-if="hasWriteAuthority" tile icon>
            <v-icon class="drag-handle"> mdi-sort</v-icon>
          </v-btn>
          <a
            class="text--anchor"
            @click="emits('click:edit', role)"
            v-text="role.name"
          />
          <v-btn tile icon small @click="emits('remove-role', role)">
            <v-icon color="error"> mdi-delete-outline </v-icon>
          </v-btn>
        </div>
        <RoleNestedDraggable
          v-if="role.id"
          v-model="role.children"
          :parent-id="role.id"
          @click:edit="(item) => emits('click:edit', item)"
          @click:delete="(item) => emits('click:delete', item)"
          @completed-load="onCompletedLoad"
        />
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>
<script setup lang="ts">
import type { Role } from "@/definitions/models";
import RoleNestedDraggable from "@/views/management/role/RoleNestedDraggable.vue";
import { tryOnMounted, useDebounceFn, useVModel } from "@vueuse/core";
import { useAuthorityStore } from "@/stores/authority";
import { computed, nextTick } from "vue";
import Sortable from "sortablejs";

const { hasWriteAuthority } = useAuthorityStore();
const props = withDefaults(defineProps<{ value: Role[]; parentId: number }>(), {
  value: () => [],
});
const emits = defineEmits<{
  (e: "input", v: Role[]): void;
  (e: "click:edit", v: Role): void;
  (e: "click:delete", v: Role): void;
  (e: "remove-role", v: Role): void;
  (e: "completed-load");
}>();

const rootFlag = computed(() => props.parentId === 0);
const value = useVModel(props, "value", emits, { eventName: "input" });

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
  const result: Role[] = [];
  for (let i = 0; i < querySelectors.length; i++) {
    const attribute = querySelectors[i].getAttribute("data-value");
    if (attribute) {
      const menu = JSON.parse(attribute) as Role;
      result.push({
        ...menu,
        children: extractSortableData(menu.id),
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
