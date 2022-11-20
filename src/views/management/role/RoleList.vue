<template>
  <div>
    <PageTitle :button-loading="saving" @click="showAddDialog">
      <template #more-buttons>
        <v-btn
          v-if="hasWriteAuthority"
          color="primary"
          outlined
          x-large
          @click="saveAll"
        >
          <v-icon> mdi-sort</v-icon>
          순서저장
        </v-btn>
        <v-btn color="primary" outlined x-large @click="fetchList">
          <v-icon> mdi-refresh</v-icon>
          새로고침
        </v-btn>
      </template>
    </PageTitle>
    <v-card :loading="loading || saving">
      <v-card-text>
        <a
          v-if="!superAdminFlag"
          class="warning--text"
          v-text="accountRoleName"
        />
        <RoleNestedDraggable
          v-if="superAdminFlag"
          v-model="items"
          :parent-id="0"
          @click:edit="showEditDialog"
          @remove-role="deleteRole"
        />
        <RoleNestedDraggable
          v-else-if="items && items.length > 0"
          v-model="items[0].children"
          :parent-id="0"
          @click:edit="showEditDialog"
          @remove-role="deleteRole"
        />
      </v-card-text>
    </v-card>
    <RoleEditDialog
      v-if="dialog"
      v-model="editItem"
      :dialog.sync="dialog"
      @created="fetchList"
      @updated="fetchList"
    />
  </div>
</template>

<script setup lang="ts">
import { deleteApi, getApi, postApi } from "@/utils/apis";
import { confirmDelete } from "@/utils/alerts";
import RoleEditDialog from "@/views/management/role/RoleEditDialog.vue";
import { defaultRole } from "@/definitions/defaults";
import type { Role } from "@/definitions/models";
import PageTitle from "@/components/title/PageTitle.vue";
import RoleNestedDraggable from "@/views/management/role/RoleNestedDraggable.vue";
import { computed, onMounted, ref } from "vue";
import useList from "@/composition/useList";
import useListDialog from "@/composition/useListDialog";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority, superAdminFlag } = useAuthorityStore();
const { items, loading, totalItems } = useList<Role>();

const { editItem, dialog, showEditDialog, showAddDialog } =
  useListDialog<Role>(defaultRole);

const saving = ref(false);

const accountRoleName = computed((): string => {
  return items.value[0]?.name ? items.value[0].name + "(yours)" : "";
});

async function fetchList(): Promise<void> {
  items.value = [];
  totalItems.value = 0;
  loading.value = true;
  const response = await getApi<Role[]>(
    superAdminFlag ? "roles/" : "mine/roles/",
  );
  loading.value = false;
  items.value = response.data ?? ([] as Role[]);
  totalItems.value = response.data?.length || 0;
}

async function saveAll(): Promise<void> {
  saving.value = true;
  const response = await postApi<Role[]>("roles/save-all/", items.value);
  saving.value = false;
  if (response.success) {
    items.value = response.data ?? [];
  }
}

async function deleteRole(value: Role): Promise<void> {
  const result = await confirmDelete(`역할 : ${value.name}`);
  if (result) {
    saving.value = true;
    const response = await deleteApi<number[]>(`roles/${value.id}`);
    saving.value = false;
    if (response.success) {
      await fetchList();
    }
  }
}

onMounted(async (): Promise<void> => {
  await fetchList();
});
</script>
