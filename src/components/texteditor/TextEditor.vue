<template>
  <div>
    <h3 v-text="label" v-if="label" class="secondary mb-3" />
    <vue-trix
      :id="trixId"
      v-model="vModel"
      :placeholder="placeholder"
      @trix-attachment-add="handleAttachmentChanges"
      :style="{
        minHeight: minHeight,
        border: '1px ridge var(--v-secondary-base)',
      }"
    />
  </div>
</template>

<script lang="ts">
import { uploadFileApi } from "@/utils/apis";
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
    filePath: { type: String, default: "text-editor" },
    apiUrl: { type: String, default: "s3-files/" },
    minHeight: { type: String, default: "40vh" },
    placeholder: { type: String, default: "Please enter text." },
  },
  setup(props, { emit }) {
    const vModel = setupVModel<string>(props, emit);
    const computes = {
      trixId: computed(() => `trixId-${props.cssId}`),
    };
    const methods = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async handleAttachmentChanges(event: any) {
        const file = event.attachment.file;

        const formData = new FormData();
        formData.append("path", props.filePath);
        formData.append("file", file);
        await uploadFileApi(props.apiUrl, formData);
        const result = await uploadFileApi(props.apiUrl, formData);

        let attributes = {
          url: result.data,
          href: result.data,
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
        selector.style.minHeight = props.minHeight;
      }
    });
    return { ...vModel, ...computes, ...methods };
  },
});
</script>

<style lang="scss">
div.trix-button-row {
  border-bottom: 1px groove var(--v-secondary-base);

  .trix-button-group {
    margin-bottom: 0;
  }
}
.trix-content {
  .attachment--preview {
    text-align: left;
  }
  .attachment__caption {
    text-align: left;
    .attachment__caption-editor {
      text-align: left;
    }
  }
  .attachment__toolbar {
    text-align: left;
  }
  .attachment__metadata {
    position: initial;
  }
}
</style>
