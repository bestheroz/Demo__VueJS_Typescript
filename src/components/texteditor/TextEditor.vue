<template>
  <div>
    <h3 v-text="label" v-if="label" class="secondary mb-3" />
    <ckeditor
      :editor="ClassicEditor"
      v-model="vModel"
      :style="{
        minHeight: minHeight,
      }"
      @ready="onEditorReady"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import setupVModel from "@/composition/setupVModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CKEditor from "@ckeditor/ckeditor5-vue2";
import ClassicEditor from "@/utils/ckeditor";
import { Editor } from "@ckeditor/ckeditor5-core";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import RootEditableElement from "@ckeditor/ckeditor5-engine/src/view/rooteditableelement";

export default defineComponent({
  components: { ckeditor: CKEditor.component },
  props: {
    value: {
      type: String,
      required: true,
    },
    label: { type: String, default: undefined },
    minHeight: { type: String, default: "40vh" },
  },
  setup(props, { emit }) {
    const vModel = setupVModel<string>(props, emit);
    const computes = {
      ClassicEditor: computed(() => ClassicEditor),
      config: computed(() => {
        return {
          toolbar: {},
        };
      }),
    };
    const methods = {
      validateText: (): boolean => {
        // html 태그 삭제 정규식
        const extractTextPattern = /(<([^>]+)>)/gi;
        return !!vModel.vModel.value.replace(extractTextPattern, "");
      },
      onEditorReady: (editor: Editor) => {
        editor.editing.view.change((writer: DowncastWriter) => {
          writer.setStyle(
            "height",
            props.minHeight,
            editor.editing.view.document.getRoot() as RootEditableElement,
          );
        });
      },
    };
    return { ...vModel, ...computes, ...methods };
  },
});
</script>
