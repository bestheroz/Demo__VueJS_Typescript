<template>
  <div>
    <v-bottom-sheet v-model="dialog" inset scrollable max-width="50vw">
      <v-card class="pb-4">
        <DialogTitle text="내 정보" @click:close="dialog = false" />
        <v-card-text>
          <validation-observer ref="observer">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  :value="item.loginId"
                  label="나의 아이디"
                  filled
                  disabled
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <validation-provider
                  v-slot="{ errors }"
                  name="나의 이름"
                  rules="required|max:100"
                >
                  <v-text-field
                    v-model="item.name"
                    label="나의 이름"
                    filled
                    :counter="100"
                    :error-messages="errors"
                    hide-details="auto"
                    class="required"
                  />
                </validation-provider>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  :value="item.role.name"
                  label="나의 역할"
                  filled
                  disabled
                  hide-details
                />
              </v-col>
            </v-row>
          </validation-observer>
          <ButtonWithIcon
            block
            text="저장"
            icon="mdi-content-save"
            :loading="loading"
            @click="save"
          />
        </v-card-text>
        <CreatedUpdatedBar
          :created-by="item.createdBy"
          :created-date-time="item.created"
          :updated-by="item.updatedBy"
          :updated-date-time="item.updated"
        />
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { getApi, patchApi } from "@/utils/apis";
import { ValidationObserver } from "vee-validate";
import DialogTitle from "@/components/title/DialogTitle.vue";
import { defaultAdmin } from "@/definitions/defaults";
import type { Admin } from "@/definitions/models";
import CreatedUpdatedBar from "@/components/history/CreatedUpdatedBar.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import { onBeforeMount, ref } from "vue";
import { useVModels } from "@vueuse/core";
import { useAdminStore } from "@/stores/admin";
import { useCodesStore } from "@/stores/codes";

const { reIssueAccessToken } = useAdminStore();
const { reloadAdminCodes } = useCodesStore();

const props = defineProps<{
  dialog: boolean;
  adminPassword: string;
}>();

const emits = defineEmits<{
  (e: "update:dialog", v: boolean): void;
}>();

const { dialog } = useVModels(props, emits);
const item = ref(defaultAdmin());
const loading = ref(false);

async function save() {
  const isValid = await observer.value?.validate();
  if (!isValid) {
    return;
  }
  loading.value = true;
  const payload = { ...item.value, password: props.adminPassword };
  const response = await patchApi<Admin>("mine", payload);
  loading.value = false;
  if (response.success) {
    await reIssueAccessToken();
    await reloadAdminCodes();
    dialog.value = false;
  }
}
onBeforeMount(async () => {
  const response = await getApi<Admin>("mine");
  item.value = response.data ?? defaultAdmin();
});
const observer = ref();
</script>
