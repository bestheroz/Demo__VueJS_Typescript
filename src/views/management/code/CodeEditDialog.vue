<template>
  <div>
    <v-bottom-sheet v-model="dialog" inset scrollable>
      <v-card class="pb-4">
        <DialogTitle
          v-model="value.availableFlag"
          :is-new="isNew"
          prefix="코드"
          with-switch
          @click:close="dialog = false"
        />
        <v-card-text>
          <v-form :readonly="!hasWriteAuthority">
            <validation-observer ref="observer">
              <v-row dense>
                <v-col cols="12" md="4">
                  <validation-provider
                    v-slot="{ errors }"
                    name="그룹 코드"
                    rules="max:50|required"
                  >
                    <v-text-field
                      v-model="value.type"
                      label="그룹 코드"
                      filled
                      dense
                      :error-messages="errors"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="4">
                  <validation-provider
                    v-slot="{ errors }"
                    name="코드"
                    rules="max:50|required"
                  >
                    <v-text-field
                      v-model="value.value"
                      label="코드"
                      filled
                      dense
                      :error-messages="errors"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="4">
                  <validation-provider
                    v-slot="{ errors }"
                    name="코드명"
                    rules="max:100|required"
                  >
                    <v-text-field
                      v-model="value.text"
                      label="코드명"
                      filled
                      dense
                      :error-messages="errors"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
              </v-row>
            </validation-observer>
            <ButtonWithIcon
              v-if="hasWriteAuthority"
              block
              text="저장"
              icon="mdi-content-save"
              :loading="loading"
              @click="save"
            />
          </v-form>
        </v-card-text>
        <CreatedUpdatedBar
          :created-by="value.createdBy"
          :created-date-time="value.created"
          :updated-by="value.updatedBy"
          :updated-date-time="value.updated"
        />
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { putApi } from "@/utils/apis";
import { ValidationObserver } from "vee-validate";
import DialogTitle from "@/components/title/DialogTitle.vue";
import type { Code } from "@/definitions/models";
import CreatedUpdatedBar from "@/components/history/CreatedUpdatedBar.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import { ref } from "vue";
import useEditDialog from "@/composition/useEditDialog";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority } = useAuthorityStore();

const props = defineProps<{ value: Code; dialog: boolean }>();
const emits = defineEmits<{
  (e: "updated", v: Code): void;
  (e: "created", v: Code): void;
  (e: "update:dialog", v: boolean): void;
  (e: "input", v: Code): void;
}>();
const { isNew, loading, create, dialog, value } = useEditDialog<Code>(
  props,
  emits,
  "codes/",
);

async function save(): Promise<void> {
  const isValid = await observer.value?.validate();
  if (!isValid) {
    return;
  }
  isNew.value ? await create() : await update();
}

async function update(): Promise<void> {
  loading.value = true;
  const response = await putApi<Code>(`codes/${value.value.id}`, value.value);
  loading.value = false;
  if (response.success) {
    dialog.value = false;
    window.sessionStorage.removeItem(`code__${value.value.type}`);
    emits("updated", response.data);
  }
}

const observer = ref();
</script>
