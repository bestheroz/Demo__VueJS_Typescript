<template>
  <div>
    <h3 v-text="label" v-if="label" class="secondary mb-3" />
    <vue-trix
      :id="trixId"
      v-model="vModel"
      :placeholder="placeholder"
      :style="{ 'min-height': minHeight }"
    />
  </div>
</template>

<script lang="ts">
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
button.trix-button--icon {
  background-color: #a6a6a6;
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
