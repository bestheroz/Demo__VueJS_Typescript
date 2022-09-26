<template>
  <div>
    <v-card class="text-center pa-1">
      <v-card-title class="justify-center text-h4 mb-2">Welcome</v-card-title>
      <v-card-subtitle>Sign in to your account</v-card-subtitle>

      <!-- sign in form -->
      <v-card-text>
        <v-form ref="form">
          <validation-observer ref="observer">
            <validation-provider
              v-slot="{ errors, valid }"
              name="ID"
              rules="required"
            >
              <v-text-field
                v-model="loginId"
                :validate-on-blur="false"
                label="ID"
                name="loginId"
                outlined
                :error-messages="errors"
                :success="valid"
                @keyup.enter="submit"
                @input="resetErrors"
              />
            </validation-provider>
            <validation-provider
              v-slot="{ errors, valid }"
              name="Password"
              rules="required"
            >
              <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                name="password"
                outlined
                :error-messages="errors"
                :success="valid"
                @input="resetErrors"
                @keyup.enter="submit"
                @click:append="showPassword = !showPassword"
              />
            </validation-provider>

            <v-btn
              :loading="loading"
              block
              x-large
              color="primary"
              @click="submit"
            >
              Sign In
            </v-btn>
            <div
              v-if="errorProvider"
              class="error--text"
              v-text="errorProviderMessages"
            />
          </validation-observer>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { axiosInstance } from "@/utils/apis";
import type { ApiDataResult } from "@/utils/apis";
import { toastCloseAll } from "@/utils/alerts";
import { getYourConfig, routerReplace } from "@/utils/commands";
import type { AxiosResponse } from "axios";
import { ValidationObserver } from "vee-validate";
import { onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import Vuetify from "@/plugins/vuetify";
import { SHA512 } from "crypto-js";
import { storeToRefs } from "pinia";
import { useConfigStore } from "@/stores/config";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";
import { useCodesStore } from "@/stores/codes";
import { useIntervalFn } from "@vueuse/core";

const { setConfig, resetDefaultConfig } = useConfigStore();
const { reloadRole, clearAuthority } = useAuthorityStore();
const { saveToken, clearAdmin } = useAdminStore();

const codesStore = useCodesStore();
const { adminCodes } = storeToRefs(codesStore);
const { reloadAdminCodes } = codesStore;

const loginId = ref("1");
const password = ref("1");
const loading = ref(false);
const errorProvider = ref(false);
const errorProviderMessages = ref("");
const showPassword = ref(false);
const reloadable = ref(true);

async function submit(): Promise<void> {
  resetErrors();
  const inValid = await observer.value?.validate();
  if (!inValid) {
    return;
  }

  loading.value = true;
  const response = await axiosInstance.post<
    { loginId: string; password: string },
    AxiosResponse<
      ApiDataResult<{
        accessToken: string;
        refreshToken: string;
      }>
    >
  >("api/sign-in", {
    loginId: loginId.value,
    password: SHA512(password.value).toString(),
  });
  loading.value = false;
  if (response.data.success && response.data.data) {
    reloadable.value = false;
    saveToken({
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
    });
    await reloadRole();
    setConfig(await getYourConfig());
    await reloadAdminCodes();
    reloadable.value = true;
    toastCloseAll();
    await routerReplace("/");
  } else {
    errorProvider.value = true;
    errorProviderMessages.value = response.data.message;
  }
}

function resetErrors(): void {
  errorProvider.value = false;
  errorProviderMessages.value = "";
}

onUnmounted(() => {
  pause();
});
onBeforeMount(() => {
  Vuetify.framework.theme.dark = false;
});
const { pause } = useIntervalFn(() => {
  if (
    reloadable.value &&
    window.localStorage.getItem("refreshToken") &&
    window.localStorage.getItem("accessToken")
  ) {
    window.location.reload();
  }
}, 1_000);
onMounted(async () => {
  if (
    window.localStorage.getItem("refreshToken") &&
    window.localStorage.getItem("accessToken")
  ) {
    await routerReplace("/");
    return;
  }

  clearAdmin();
  await resetDefaultConfig();
  clearAuthority();
  adminCodes.value = [];
  window.localStorage.clear();
  window.sessionStorage.clear();
});
const observer = ref();
</script>
