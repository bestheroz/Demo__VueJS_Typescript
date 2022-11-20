<template>
  <v-list
    class="pt-0 mb-1 sortableListItem"
    :class="`${!rootFlag ? 'ml-5' : ''} ${className}`"
  >
    <v-list-item
      v-for="item in value"
      :key="item.menu.id"
      dense
      class="pr-0"
      :data-value="JSON.stringify({ ...item, children: [] })"
    >
      <v-row no-gutters>
        <v-col sm="12" lg="5">
          <v-list-item-icon>
            <v-icon style="top: 4px" v-text="item.menu.icon" />
          </v-list-item-icon>
          <v-list-item-title class="d-inline">
            <v-btn v-if="hasWriteAuthority" icon small>
              <v-icon class="drag-handle"> mdi-sort </v-icon>
            </v-btn>
            {{ item.menu.name }}
          </v-list-item-title>
        </v-col>
        <v-col sm="12" lg="7" class="text-right">
          <v-btn-toggle
            v-if="item.menu.type !== MENU_TYPE.GROUP"
            v-model="item.authoritiesJson"
            active-class="primary"
            tile
            multiple
            class="transparent"
          >
            <v-btn
              :value="ROLE_AUTHORITY_TYPE.VIEW"
              disabled
              style="
                background-color: var(--v-primary-base) !important;
                color: white !important;
              "
            >
              보기
            </v-btn>

            <v-btn
              :value="ROLE_AUTHORITY_TYPE.WRITE"
              :disabled="hasWriteAuthority && roleId === adminStore.roleId"
              :class="
                item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.WRITE)
                  ? 'white--text'
                  : 'text--secondary'
              "
            >
              편집
            </v-btn>

            <v-btn
              :value="ROLE_AUTHORITY_TYPE.DELETE"
              :disabled="hasWriteAuthority && roleId === adminStore.roleId"
              :class="
                item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.DELETE)
                  ? 'white--text'
                  : 'text--secondary'
              "
            >
              삭제
            </v-btn>

            <v-btn
              :value="ROLE_AUTHORITY_TYPE.EXCEL"
              :disabled="hasWriteAuthority && roleId === adminStore.roleId"
              :class="
                item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.EXCEL)
                  ? 'white--text'
                  : 'text--secondary'
              "
            >
              엑셀
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col v-if="item.menu.type === MENU_TYPE.GROUP" cols="12">
          <RoleMenuNestedDraggable
            v-if="item.id"
            v-model="item.children"
            :parent-id="item.id"
            :role-id="roleId"
            @completed-load="onCompletedLoad"
          />
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>
<script setup lang="ts">
import type { RoleMenuMap } from "@/definitions/models";
import { MENU_TYPE, ROLE_AUTHORITY_TYPE } from "@/definitions/selections";
import { tryOnMounted, useDebounceFn, useVModel } from "@vueuse/core";
import RoleMenuNestedDraggable from "@/views/management/role/menu/RoleMenuNestedDraggable.vue";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";
import Sortable from "sortablejs";
import { computed, nextTick } from "vue";

const { hasWriteAuthority } = useAuthorityStore();
const adminStore = useAdminStore();

const props = defineProps<{
  value: RoleMenuMap[];
  roleId: number;
  parentId: number;
}>();
const emits = defineEmits<{
  (e: "input", v: RoleMenuMap[]): void;
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
  const result: RoleMenuMap[] = [];
  for (let i = 0; i < querySelectors.length; i++) {
    const attribute = querySelectors[i].getAttribute("data-value");
    if (attribute) {
      const menu = JSON.parse(attribute) as RoleMenuMap;
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
