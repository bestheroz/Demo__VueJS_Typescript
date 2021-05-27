<template>
  <div class="w-full">
    <page-title @click="showAddDialog" />
    <code-type ref="refCodeType" @selected="onCodeTypeSelected" />
    <v-divider />
    <code-list ref="refCodeList" :type="type" @created="onCreated" />
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "vue-property-decorator";
import CodeList from "@/views/admin/code/CodeList.vue";
import CodeType from "@/views/admin/code/CodeType.vue";
import { Code } from "@/definitions/models";
import PageTitle from "@/components/title/PageTitle.vue";

@Component({
  components: {
    PageTitle,
    CodeType,
    CodeList,
  },
})
export default class extends Vue {
  @Ref() readonly refCodeList!: CodeList;
  @Ref() readonly refCodeType!: CodeType;

  type = "";

  protected mounted(): void {
    this.refCodeList.getList();
  }

  protected onCreated(value: Code): void {
    this.refCodeType.onCreate(value);
  }

  protected onCodeTypeSelected(val: string): void {
    this.type = val;
  }

  protected showAddDialog(): void {
    this.refCodeList.showAddDialog();
  }
}
</script>
