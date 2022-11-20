<template>
  <v-list
    class="pt-0 sortableListItem"
    :class="`${!rootFlag ? 'ml-5' : ''} ${className} ${
      hasGroupMenuChild ? 'pb-1' : 'pb-0'
    }`"
  >
    <v-list-item
      v-for="item in value"
      :key="item.menu.id"
      dense
      class="pr-0"
      :data-value="JSON.stringify({ ...item, children: [] })"
    >
      <v-list-item-icon
        v-if="item.menu.type === MENU_TYPE.GROUP"
        :class="{ 'pt-1': hasWriteAuthority }"
      >
        <v-icon v-text="item.menu.icon" />
      </v-list-item-icon>
      <v-list-item-title class="pt-1">
        <v-row no-gutters>
          <v-col cols="4">
            <v-btn tile v-if="hasWriteAuthority" icon>
              <v-icon class="drag-handle"> mdi-sort </v-icon>
            </v-btn>
            {{ item.menu.name }}
          </v-col>
          <v-col cols="8" class="text-right">
            <v-btn-toggle
              v-if="item.menu.type !== MENU_TYPE.GROUP"
              v-model="item.authoritiesJson"
              active-class="primary"
              tile
              multiple
              class="transparent"
            >
              <v-btn
                tile
                small
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
                tile
                small
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
                tile
                small
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
                tile
                small
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
        </v-row>
        <RoleMenuNestedDraggable
          v-if="item.menu.type === MENU_TYPE.GROUP"
          v-model="item.children"
          :parent-id="item.menu.id"
          :role-id="roleId"
          @completed-load="onCompletedLoad"
        />
      </v-list-item-title>
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
  parentId?: number;
}>();
const emits = defineEmits<{
  (e: "input", v: RoleMenuMap[]): void;
  (e: "completed-load");
}>();

const rootFlag = computed(() => props.parentId === 0);
const value = useVModel(props, "value", emits, { eventName: "input" });

const className = computed(() => `sortableListItem-${props.parentId}`);

const hasGroupMenuChild = computed(() =>
  value.value.some((v) => v.menu.type === MENU_TYPE.GROUP),
);

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
      const map = JSON.parse(attribute) as RoleMenuMap;
      result.push({
        ...map,
        children:
          map.menu.type === MENU_TYPE.GROUP
            ? extractSortableData(map.menu.id)
            : [],
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
