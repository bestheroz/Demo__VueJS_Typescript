<template>
  <div class="w-full">
    <PageTitle
      button-icon="mdi-content-save"
      button-text="저장"
      :button-loading="saving"
      @click="saveItems"
      :hide-button="roleId === adminStore.roleId"
    >
      <template #more-buttons>
        <v-btn @click="fetchList" color="primary" outlined x-large>
          <v-icon> mdi-refresh </v-icon> 새로고침
        </v-btn>
      </template>
    </PageTitle>
    <v-card>
      <v-card-text>
        <DataTableFilter :filters="filters" :output.sync="filterOutput" />
        <RoleMenuList ref="refRoleMenuList" :role-id="roleId" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import RoleMenuList from "@/views/management/role/menu/RoleMenuList.vue";
import PageTitle from "@/components/title/PageTitle.vue";
import { Role } from "@/definitions/models";
import DataTableFilter from "@/components/datatable/DataTableFilter.vue";
import { Filter, FilterOutput } from "@/definitions/types";
import { getApi } from "@/utils/apis";
import { computed, onBeforeMount, ref } from "vue";
import { FILTER_TYPE } from "@/definitions/selections";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();

const roles = ref<Role[]>([]);
const saving = ref(false);
const filterOutput = ref<FilterOutput>({});

const filters = computed((): Filter[] => [
  {
    type: FILTER_TYPE.CHECKBOX,
    text: "타입",
    key: "roleId",
    single: true,
    required: true,
    items: roles.value.map((v, index) => {
      return { value: v.id || 0, text: v.name, checked: index === 0 };
    }),
  },
]);

const roleId = computed((): number => filterOutput.value.roleId?.[0] as number);

async function saveItems(): Promise<void> {
  saving.value = true;
  await refRoleMenuList.value?.saveItems();
  saving.value = false;
}
async function getRoles(): Promise<void> {
  const response = await getApi<Role[]>("mine/roles/selections/");
  roles.value = (response.data ?? []).filter((r) => r.id !== 1);
}
async function fetchList() {
  await refRoleMenuList.value?.fetchList();
}
onBeforeMount(() => {
  getRoles().then();
});
const refRoleMenuList = ref();
</script>
