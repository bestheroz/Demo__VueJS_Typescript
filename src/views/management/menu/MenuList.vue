<template>
  <div>
    <PageTitle @click="showAddDialog" :button-loading="saving">
      <template #more-buttons>
        <v-btn
          @click="saveAll"
          color="primary"
          outlined
          x-large
          v-if="hasWriteAuthority"
        >
          <v-icon> mdi-sort </v-icon> 순서저장
        </v-btn>
        <v-btn @click="fetchList" color="primary" outlined x-large>
          <v-icon> mdi-refresh </v-icon> 새로고침
        </v-btn>
      </template>
    </PageTitle>
    <v-card :loading="loading || saving">
      <v-card-text>
        <MenuNestedDraggable
          v-model="items"
          @click:edit="showEditDialog"
          @click:delete="onDelete"
        />
      </v-card-text>
    </v-card>
    <MenuEditDialog
      v-model="editItem"
      :dialog.sync="dialog"
      @created="fetchList"
      @updated="fetchList"
      v-if="dialog"
    />
  </div>
</template>

<script setup lang="ts">
import { deleteApi, getApi, postApi } from "@/utils/apis";
import { confirmDelete } from "@/utils/alerts";
import MenuEditDialog from "@/views/management/menu/MenuEditDialog.vue";
import { defaultMenu } from "@/definitions/defaults";
import type { Menu } from "@/definitions/models";
import PageTitle from "@/components/title/PageTitle.vue";
import MenuNestedDraggable from "@/views/management/menu/MenuNestedDraggable.vue";
import { onMounted, ref } from "vue";
import useList from "@/composition/useList";
import useListDialog from "@/composition/useListDialog";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority, reloadRole } = useAuthorityStore();
const { editItem, dialog, showEditDialog, showAddDialog } =
  useListDialog<Menu>(defaultMenu);
const { items, loading } = useList<Menu>();

const saving = ref(false);

async function fetchList(): Promise<void> {
  items.value = [];
  loading.value = true;
  const response = await getApi<Menu[]>("menus/");
  loading.value = false;
  items.value = response.data ?? [];
}

async function onDelete(value: Menu): Promise<void> {
  const result = await confirmDelete(`메뉴명: ${value.name}`);
  if (result) {
    saving.value = true;
    const response = await deleteApi<Menu>(`menus/${value.id}`);
    saving.value = false;
    if (response.success) {
      await reloadRole();
      await fetchList();
    }
  }
}

async function saveAll(): Promise<void> {
  saving.value = true;
  const response = await postApi<Menu[]>("menus/save-all/", items.value);
  saving.value = false;
  if (response.success) {
    reloadRole().then();
    items.value = response.data ?? [];
  }
}

onMounted(async (): Promise<void> => {
  await fetchList();
});
</script>
