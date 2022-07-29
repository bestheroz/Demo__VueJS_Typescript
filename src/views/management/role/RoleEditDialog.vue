<template>
  <div>
    <v-bottom-sheet v-model="dialog" inset scrollable>
      <v-card class="pb-4">
        <DialogTitle
          v-model="value.available"
          :is-new="isNew"
          prefix="역할"
          with-switch
          @click:close="dialog = false"
        />
        <v-card-text>
          <v-form :readonly="!hasWriteAuthority">
            <validation-observer ref="observer">
              <v-row>
                <v-col cols="12" md="6">
                  <validation-provider
                    v-slot="{ errors }"
                    name="역할명"
                    rules="required|max:50"
                  >
                    <v-text-field
                      v-model="value.name"
                      label="역할명"
                      :counter="50"
                      :error-messages="errors"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
              </v-row>
            </validation-observer>
            <ButtonWithIcon
              block
              text="저장"
              icon="mdi-content-save"
              :loading="loading"
              @click="save"
              v-if="hasWriteAuthority"
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
import { postApi } from "@/utils/apis";
import { ValidationObserver } from "vee-validate";
import DialogTitle from "@/components/title/DialogTitle.vue";
import type { Role } from "@/definitions/models";
import CreatedUpdatedBar from "@/components/history/CreatedUpdatedBar.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import { ref } from "vue";
import useEditDialog from "@/composition/useEditDialog";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";

const { superAdminFlag, hasWriteAuthority } = useAuthorityStore();
const { roleId } = useAdminStore();
const props = defineProps<{ value: Role; dialog: boolean }>();

const emits = defineEmits<{
  (e: "updated", v: Role): void;
  (e: "created", v: Role): void;
  (e: "update:dialog", v: boolean): void;
  (e: "input", v: Role): void;
}>();

const { value, dialog, update, loading, isNew } = useEditDialog<Role>(
  props,
  emits,
  "roles/",
);

async function save(): Promise<void> {
  const isValid = await observer.value?.validate();
  if (!isValid) {
    return;
  }
  isNew.value ? await create() : await update();
}

async function create(): Promise<void> {
  loading.value = true;
  const response = await postApi<Role>(
    `roles/?parentId=${superAdminFlag ? "" : roleId}`,
    value.value,
  );
  loading.value = false;
  if (response.success) {
    dialog.value = false;
    emits("created", response.data);
  }
}
const observer = ref();
</script>
