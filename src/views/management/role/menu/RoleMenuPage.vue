<template>
  <div class="w-full">
    <page-title
      button-icon="mdi-content-save"
      button-text="저장"
      @click="saveItems"
    />
    <v-card flat :loading="loading">
      <v-card-text class="py-0">
        <v-chip-group v-model.number="roleId" column mandatory dense>
          <v-chip
            v-for="item in roles"
            :value="item.value"
            filter
            :outlined="roleId !== item.value"
            color="primary"
            :key="item.value"
            v-text="item.text"
            class="px-4"
            label
          />
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-divider />
    <role-menu-list ref="refRoleMenuList" :role-id="roleId" />
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "vue-property-decorator";
import RoleMenuList from "@/views/management/role/menu/RoleMenuList.vue";
import PageTitle from "@/components/title/PageTitle.vue";
import { SelectItem } from "@/definitions/types";
import { getApi } from "@/utils/apis";

@Component({
  components: {
    PageTitle,
    RoleMenuList,
  },
})
export default class extends Vue {
  @Ref() readonly refRoleMenuList!: RoleMenuList;

  roles: SelectItem<number>[] = [];
  roleId: number | null = null;
  loading = false;

  protected async created(): Promise<void> {
    const response = await getApi<SelectItem<number>[]>("roles/codes");
    this.roles = response.data || [];
  }

  protected async saveItems(): Promise<void> {
    await this.refRoleMenuList.saveItems();
  }
}
</script>
