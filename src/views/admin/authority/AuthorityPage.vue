<template>
  <div class="w-full">
    <page-title
      button-icon="mdi-content-save"
      button-text="저장"
      @click="saveItems"
    />
    <v-card flat :loading="loading">
      <v-card-text class="py-0">
        <v-chip-group v-model="authority" column mandatory dense>
          <v-chip
            v-for="item in AuthorityTypes"
            :value="item.value"
            filter
            :outlined="authority !== item.value"
            color="primary"
            :key="item.value"
            v-text="item.text"
            class="px-4"
          />
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-divider />
    <authority-list ref="refAuthorityList" v-model="authority" />
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "vue-property-decorator";
import AuthorityList from "@/views/admin/authority/AuthorityList.vue";
import PageTitle from "@/components/title/PageTitle.vue";
import { AuthorityTypes } from "@/definitions/selections";

@Component({
  components: {
    PageTitle,
    AuthorityList,
  },
})
export default class extends Vue {
  @Ref() readonly refAuthorityList!: AuthorityList;

  authority: string | null = null;
  loading = false;
  readonly AuthorityTypes = AuthorityTypes;

  protected async saveItems(): Promise<void> {
    await this.refAuthorityList.saveItems();
  }
}
</script>
