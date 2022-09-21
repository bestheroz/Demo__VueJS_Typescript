<template>
  <div>
    <v-bottom-sheet v-model="dialog" inset scrollable max-width="25vw">
      <v-card class="pb-4">
        <DialogTitle text="비밀번호 변경" @click:close="dialog = false" />
        <v-card-text>
          <validation-observer ref="observer">
            <v-row dense>
              <v-col cols="12">
                <validation-provider
                  v-slot="{ errors }"
                  name="이전 비밀번호"
                  vid="oldPassword"
                  rules="required|max:20"
                >
                  <v-text-field
                    v-model="oldPassword"
                    label="이전 비밀번호"
                    filled
                    :error-messages="errors"
                    hide-details="auto"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    class="required"
                    @click:append="show1 = !show1"
                  />
                </validation-provider>
              </v-col>
              <v-col cols="12">
                <validation-provider
                  v-slot="{ errors }"
                  name="비밀번호"
                  vid="password"
                  rules="required|max:20"
                >
                  <v-text-field
                    v-model="password"
                    label="비밀번호"
                    filled
                    :error-messages="errors"
                    hide-details="auto"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show2 ? 'text' : 'password'"
                    class="required"
                    @click:append="show2 = !show2"
                  />
                </validation-provider>
              </v-col>
              <v-col cols="12">
                <validation-provider
                  v-slot="{ errors }"
                  name="비밀번호 확인"
                  rules="required|confirmed:password|max:20"
                >
                  <v-text-field
                    v-model="password2"
                    label="비밀번호 확인"
                    filled
                    :error-messages="errors"
                    hide-details="auto"
                    :append-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show3 ? 'text' : 'password'"
                    class="required"
                    @keyup.enter="save"
                    @click:append="show3 = !show3"
                  />
                </validation-provider>
              </v-col>
            </v-row>
          </validation-observer>
        </v-card-text>
        <ButtonWithIcon
          block
          text="저장"
          icon="mdi-content-save"
          :loading="loading"
          @click="save"
        />
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { patchApi } from "@/utils/apis";
import { ValidationObserver } from "vee-validate";
import DialogTitle from "@/components/title/DialogTitle.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import { ref } from "vue";
import { SHA512 } from "crypto-js";
import { useVModels } from "@vueuse/core";

const props = defineProps<{
  dialog: boolean;
}>();

const emits = defineEmits<{
  (e: "update:dialog", v: boolean): void;
}>();

const { dialog } = useVModels(props, emits);

const loading = ref(false);
const oldPassword = ref("");
const password = ref("");
const password2 = ref("");
const show1 = ref(false);
const show2 = ref(false);
const show3 = ref(false);

async function save(): Promise<void> {
  const isValid = await observer.value?.validate();
  if (!isValid) {
    return;
  }
  loading.value = true;
  const response = await patchApi<{
    oldPassword: string;
    newPassword: string;
  }>("mine/password", {
    oldPassword: SHA512(oldPassword.value).toString(),
    newPassword: SHA512(password.value).toString(),
  });
  loading.value = false;
  if (response.success) {
    dialog.value = false;
  }
}
const observer = ref();
</script>
