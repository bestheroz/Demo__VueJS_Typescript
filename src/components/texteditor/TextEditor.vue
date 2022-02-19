<template>
  <div>
    <h3 v-text="label" v-if="label" class="secondary mb-3" />
    <vue-trix
      :id="trixId"
      v-model="vModel"
      :placeholder="placeholder"
      :height="height"
      @trix-attachment-add="handleAttachmentChanges"
      :style="{ height: height }"
    />
  </div>
</template>

<script lang="ts">
import { uploadFileApi } from "@/utils/apis";
import { getImageUrl } from "@/utils/formatter";
import { computed, defineComponent, onMounted } from "@vue/composition-api";
import setupVModel from "@/composition/setupVModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VueTrix from "vue-trix";

export default defineComponent({
  components: { VueTrix },
  props: {
    value: {
      type: String,
      required: true,
    },
    cssId: { type: String, default: "" },
    label: { type: String, default: undefined },
    folderName: { type: String, default: "uploaded/textEditor" },
    apiUrl: { type: String, default: "upload/file" },
    height: { type: String, default: "40vh" },
    placeholder: { type: String, default: "Please enter text." },
  },
  setup(props, { emit }) {
    const vModel = setupVModel<string>(props, emit);
    const computes = {
      trixId: computed(() => `trixId#${props.cssId}`),
    };
    const methods = {
      async handleAttachmentChanges(event: any) {
        // 1. get file object
        const file = event.attachment.file;

        // 2. upload file to remote server with FormData
        const formData = new FormData();
        formData.append("folderName", props.folderName);
        formData.append("file", file);
        await uploadFileApi(props.apiUrl, formData);
        const result = await uploadFileApi(props.apiUrl, formData);

        // 3. if upload success, set back the attachment's URL attribute
        // @param object data from remote server response data after upload.
        let attributes = {
          url: getImageUrl(result.data),
          href: getImageUrl(result.data),
        };
        event.attachment.setAttributes(attributes);
      },

      validateText: (): boolean => {
        // html 태그 삭제 정규식
        const extractTextPattern = /(<([^>]+)>)/gi;
        return !!vModel.vModel.value.replace(extractTextPattern, "");
      },
    };
    onMounted(() => {
      const selector = document.querySelector<HTMLElement>(
        `#${computes.trixId.value}>trix-editor`,
      );
      if (selector) {
        selector.style.height = props.height;
      }
    });
    return { ...vModel, ...computes, ...methods };
  },
});
</script>

<style lang="scss">
button.trix-button--icon {
  background-color: #a6a6a6;
}
</style>
