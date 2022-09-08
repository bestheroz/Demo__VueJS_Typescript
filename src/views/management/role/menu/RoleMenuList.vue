<template>
  <div>
    <v-card flat :loading="loading">
      <v-row dense>
        <v-col sm="12" md="6">
          <RoleMenuNestedDraggable
            v-model="items"
            :role-id="roleId"
            root-flag
            v-if="roleId"
          />
        </v-col>
        <v-col sm="12" md="6">
          <v-card-text class="py-0 elevation-1">
            <v-chip-group
              v-model="selected"
              multiple
              column
              @change="onChangeSelectedChip"
            >
              <RoleMenuMenuItem
                v-model="selected"
                :menus="menus"
                :disabled="hasWriteAuthority && adminStore.roleId === roleId"
              />
            </v-chip-group>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { getApi, postApi } from "@/utils/apis";
import type { Menu, RoleMenuMap } from "@/definitions/models";
import { MENU_TYPE } from "@/definitions/selections";
import RoleMenuMenuItem from "@/views/management/role/menu/RoleMenuMenuItem.vue";
import RoleMenuNestedDraggable from "@/views/management/role/menu/RoleMenuNestedDraggable.vue";
import { defaultRoleMenuMap } from "@/definitions/defaults";
import { computed, ref, watch } from "vue";
import useList from "@/composition/useList";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";

const { hasWriteAuthority, reloadRole } = useAuthorityStore();
const adminStore = useAdminStore();

const props = withDefaults(
  defineProps<{
    roleId?: number;
  }>(),
  { roleId: undefined },
);
const { items, loading } = useList<RoleMenuMap>();

const menus = ref<Menu[]>([]);
const selected = ref<number[]>([]);

const flattMenus = computed((): Menu[] => getMenusFromChildren(menus.value));

const flatItems = computed((): RoleMenuMap[] =>
  getItemsWithChildren(items.value),
);

async function fetchList(): Promise<void> {
  menus.value = await getMenus(props.roleId);

  if (menus.value.length === 0 || !props.roleId) {
    items.value = [];
    selected.value = [];
    return;
  }
  loading.value = true;
  const response = await getApi<RoleMenuMap[]>(`roles/${props.roleId}/maps/`);
  loading.value = false;
  items.value = response.data;
  selected.value =
    flatItems.value
      .filter((item) =>
        flattMenus.value.some((menu) => menu.id === item.menu.id),
      )
      .map((item) => item.menu.id || 0) ?? [];
}

async function getMenus(roleId: number): Promise<Menu[]> {
  if (adminStore.roleId === roleId) {
    const response = await getApi<Menu[]>(`menus/?roleId=${roleId}`);
    return response.data ?? [];
  } else {
    const response = await getApi<Menu[]>(`menus/?childRoleId=${roleId}`);
    return response.data ?? [];
  }
}

function onChangeSelectedChip(selected: number[]): void {
  // 삭제!
  items.value = removeNotSelectedChildrenItem(selected, items.value);

  for (const selectedId of selected.filter((selectedId) =>
    flatItems.value.every((item) => item.menu.id !== selectedId),
  )) {
    const foundMenu = flattMenus.value.find((m) => m.id === selectedId);
    if (foundMenu) {
      items.value = [
        ...items.value,
        {
          ...(items.value.find((item) => item.menu.id === selectedId) || {
            ...defaultRoleMenuMap(),
            menu: { ...foundMenu, children: [] },
          }),
        } as RoleMenuMap,
      ];
    }
  }
}

function removeNotSelectedChildrenItem(
  selected: number[],
  items: RoleMenuMap[],
): RoleMenuMap[] {
  const filtered = items.filter((item) => selected.includes(item.menu.id || 0));
  for (const item of filtered.filter(
    (item) => item.menu.type === MENU_TYPE.GROUP,
  )) {
    item.children = removeNotSelectedChildrenItem(
      selected,
      item.children ?? [],
    );
  }
  return filtered;
}

async function saveItems(): Promise<void> {
  const response = await postApi<RoleMenuMap[]>(
    `roles/${props.roleId}/maps/save-all/`,
    items.value,
  );
  if (response.success && response.data) {
    items.value = response.data;
    if (props.roleId === adminStore.roleId) {
      await reloadRole();
    }
  }
}

function getMenusFromChildren(menus: Menu[]): Menu[] {
  let result = [] as Menu[];
  for (const menu of menus) {
    if (menu.type === MENU_TYPE.GROUP) {
      result = [...result, menu, ...getMenusFromChildren(menu.children)];
    } else {
      result = [...result, menu];
    }
  }
  return result;
}

function getItemsWithChildren(roleMenus: RoleMenuMap[]): RoleMenuMap[] {
  let result = [] as RoleMenuMap[];
  for (const roleMenu of roleMenus) {
    if (roleMenu.menu.type === MENU_TYPE.GROUP) {
      result = [
        ...result,
        roleMenu,
        ...getItemsWithChildren(roleMenu.children ?? []),
      ];
    } else {
      result = [...result, roleMenu];
    }
  }
  return result;
}

watch(
  () => props.roleId,
  async (val: number): Promise<void> => {
    if (!val) {
      return;
    }
    await fetchList();
  },
  {
    immediate: true,
  },
);

defineExpose({ fetchList, saveItems });
</script>
