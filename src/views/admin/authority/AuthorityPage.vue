<template>
  <div class="w-full">
    <page-title
      button-icon="mdi-content-save"
      button-text="저장"
      @click="saveItems"
    />
    <v-card flat :loading="loading">
      <v-card-text class="py-0">
        <v-chip-group v-model.number="authorityId" column mandatory dense>
          <v-chip
            v-for="item in AUTHORITY"
            :value="item.value"
            filter
            :outlined="authorityId !== item.value"
            color="primary"
            :key="item.value"
            v-text="item.text"
          />
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-divider />
    <authority-list
      ref="refAuthorityList"
      v-model="selectedItem"
      v-if="selectedItem"
      @click:reload="getList"
    />
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from "vue-property-decorator";
import { SelectItem } from "@/definitions/types";
import AuthorityList from "@/views/admin/authority/AuthorityList.vue";
import { getApi } from "@/utils/apis";
import { Authority } from "@/definitions/models";
import PageTitle from "@/components/title/PageTitle.vue";

@Component({
  components: {
    PageTitle,
    AuthorityList,
  },
})
export default class extends Vue {
  items: Authority[] = [];
  authorityId: number | null = null;
  loading = false;
  selectedItem: Authority | null = null;

  @Ref() readonly refAuthorityList!: AuthorityList;

  get AUTHORITY(): SelectItem<number>[] {
    return this.items
      .filter((i) => i.code !== "SUPER")
      .map((i) => {
        return { value: i.id || 0, text: i.name };
      });
  }

  @Watch("authorityId")
  protected watchAuthority(val: number | null): void {
    this.selectedItem = this.items.find((item) => item.id === val) || null;
    if (this.selectedItem) {
      const findIndex = this.items.findIndex(
        (item) => item.id === this.selectedItem?.id,
      );
      this.items = [
        ...this.items.slice(0, findIndex),
        this.selectedItem,
        ...this.items.slice(findIndex + 1),
      ];
    }
  }

  protected mounted(): void {
    this.getList().then();
  }

  protected async getList(): Promise<void> {
    this.loading = true;
    const response = await getApi<Authority[]>("admin/authorities/");
    this.items = (response.data || []).map((item) => {
      return { ...item, items: item.items || [] };
    });
    this.loading = false;
  }

  protected async saveItems(): Promise<void> {
    await this.refAuthorityList.saveItems();
  }
}
</script>
