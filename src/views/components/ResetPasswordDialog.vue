<template>
  <div>
    <v-bottom-sheet v-model="dialog" inset scrollable max-width="25vw">
      <v-card class="pb-4">
        <DialogTitle text="비밀번호 초기화" @click:close="dialog = false" />
        <v-card-text>
          <validation-observer ref="observer">
            <v-row>
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
                    :counter="20"
                    :error-messages="errors"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword"
                    class="required"
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
                    v-model="passwordCheck"
                    label="비밀번호 확인"
                    :counter="20"
                    :error-messages="errors"
                    :append-icon="showPasswordCheck ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPasswordCheck ? 'text' : 'password'"
                    @keyup.enter="resetPassword"
                    @click:append="showPasswordCheck = !showPasswordCheck"
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
            @click="resetPassword"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { patchApi } from "@/utils/apis";
import { ValidationObserver } from "vee-validate";
import DialogTitle from "@/components/title/DialogTitle.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import { Admin } from "@/definitions/models";
import { ref } from "vue";
import { SHA512 } from "crypto-js";
import { useVModels } from "@vueuse/core";

const props = defineProps<{
  dialog: boolean;
  adminId: number;
}>();

const emits = defineEmits<{
  (e: "update:dialog", v: boolean): void;
}>();

const { dialog } = useVModels(props, emits);

const loading = ref(false);
const password = ref("");
const passwordCheck = ref("");
const showPassword = ref(false);
const showPasswordCheck = ref(false);

async function resetPassword(): Promise<void> {
  const isValid = await observer.value?.validate();
  if (!isValid) {
    return;
  }
  loading.value = true;

  await patchApi<Admin>(
    `admins/${props.adminId}/reset-password`,
    SHA512(password.value).toString(),
  );
  loading.value = false;
  dialog.value = false;
}

const observer = ref();
</script>
