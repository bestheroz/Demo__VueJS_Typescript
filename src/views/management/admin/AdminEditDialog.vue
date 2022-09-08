<template>
  <div>
    <v-bottom-sheet v-model="dialog" inset scrollable>
      <v-card class="pb-4">
        <DialogTitle
          v-model="value.availableFlag"
          :is-new="isNew"
          prefix="관리자"
          :suffix="noneWriteAuthority ? '보기' : ''"
          with-switch
          :disabled-switch="noneWriteAuthority"
          @click:close="dialog = false"
        />
        <v-card-text>
          <v-form :readonly="noneWriteAuthority">
            <validation-observer ref="observer">
              <v-row>
                <v-col cols="12" md="3">
                  <validation-provider
                    v-slot="{ errors }"
                    name="관리자 아이디"
                    rules="required|max:20"
                  >
                    <v-text-field
                      v-model="value.loginId"
                      label="관리자 아이디"
                      :counter="20"
                      :error-messages="loginIdErrorText || errors"
                      :success-messages="loginIdSuccessText"
                      :append-icon="loginIdAppendIcon"
                      class="required"
                      :loading="loading"
                      @input="checkExistsLoginId"
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="3">
                  <validation-provider
                    v-slot="{ errors }"
                    name="관리자 이름"
                    rules="required|max:20"
                  >
                    <v-text-field
                      v-model="value.name"
                      label="관리자 이름"
                      :counter="20"
                      :error-messages="errors"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="3">
                  <validation-provider
                    v-slot="{ errors }"
                    name="역할"
                    rules="required"
                  >
                    <v-input :value="value.role.id" class="d-none" />
                    <RoleSelections
                      v-model="value.role"
                      :error-messages="errors"
                      :param-available="true"
                      :disabled="noneWriteAuthority"
                      required
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="3">
                  <DatetimePicker
                    v-model="value.expired"
                    label="만료일"
                    full-width
                    :disabled="noneWriteAuthority"
                    required
                  />
                </v-col>
                <v-col cols="12" md="3" v-if="isNew">
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
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="show1 ? 'text' : 'password'"
                      @click:append="show1 = !show1"
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="3" v-if="!noneWriteAuthority">
                  <validation-provider
                    v-if="isNew"
                    v-slot="{ errors }"
                    name="비밀번호 확인"
                    rules="required|confirmed:password|max:20"
                  >
                    <v-text-field
                      v-model="password2"
                      label="비밀번호 확인"
                      :counter="20"
                      :error-messages="errors"
                      :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="show2 ? 'text' : 'password'"
                      clearable
                      @click:append="show2 = !show2"
                      class="required"
                    />
                  </validation-provider>
                  <v-btn
                    v-else-if="roleId !== value.role.id"
                    color="primary"
                    outlined
                    @click="resetPasswordDialog = true"
                  >
                    비밀번호 초기화
                  </v-btn>
                </v-col>
              </v-row>
            </validation-observer>
            <ButtonWithIcon
              block
              text="저장"
              icon="mdi-content-save"
              :disabled="
                !loginIdSuccessText && originalLoginId !== value.loginId
              "
              :loading="saving"
              @click="save"
              v-if="!noneWriteAuthority"
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

    <ResetPasswordDialog
      :dialog.sync="resetPasswordDialog"
      :admin-id="value.id"
      v-if="resetPasswordDialog && value.id"
    />
  </div>
</template>

<script setup lang="ts">
import { getApi, patchApi, postApi } from "@/utils/apis";
import DatetimePicker from "@/components/picker/DatetimePicker.vue";
import { ValidationObserver } from "vee-validate";
import DialogTitle from "@/components/title/DialogTitle.vue";
import ResetPasswordDialog from "@/views/components/ResetPasswordDialog.vue";
import type { Admin } from "@/definitions/models";
import CreatedUpdatedBar from "@/components/history/CreatedUpdatedBar.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import RoleSelections from "@/views/management/role/RoleSelections.vue";
import useEditDialog from "@/composition/useEditDialog";
import { computed, onBeforeMount, ref } from "vue";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";
import { useCodesStore } from "@/stores/codes";
import { SHA512 } from "crypto-js";
import { useDebounceFn } from "@vueuse/core";

const { superAdminFlag, writeAuthority } = useAuthorityStore();
const { id, roleId, reIssueAccessToken } = useAdminStore();
const { reloadAdminCodes } = useCodesStore();

const props = defineProps<{
  value: Admin;
  dialog: boolean;
}>();

const emits = defineEmits<{
  (e: "created", v: Admin): void;
  (e: "updated", v: Admin): void;
  (e: "update:dialog", v: boolean): void;
  (e: "input", v: Admin): void;
}>();

const { value, dialog, loading, isNew } = useEditDialog<Admin>(
  props,
  emits,
  "admins/",
);

const saving = ref(false);
const password = ref("");
const password2 = ref("");
const show1 = ref(false);
const show2 = ref(false);
const resetPasswordDialog = ref(false);
const existsLoginId = ref(false);
const originalLoginId = ref("");
const checked = ref(true);

const debouncedCheckExistsLoginId = useDebounceFn(async (): Promise<void> => {
  loading.value = true;
  const response = await getApi<boolean>(
    `admins/exists-login-id?loginId=${value.value.loginId}`,
  );
  loading.value = false;
  checked.value = true;
  existsLoginId.value = response.data;
}, 500);

const noneWriteAuthority = computed(
  (): boolean =>
    !superAdminFlag &&
    (!writeAuthority ||
      roleId === value.value.role.id ||
      !value.value.role.availableFlag) &&
    !isNew.value,
);

const loginIdErrorText = computed((): string[] | undefined => {
  if (!checked.value) {
    return undefined;
  }
  if (value.value.loginId === originalLoginId.value) {
    return undefined;
  }
  return existsLoginId.value ? ["사용할 수 없는 아이디입니다."] : undefined;
});

const loginIdSuccessText = computed((): string[] | undefined => {
  if (!checked.value) {
    return undefined;
  }
  if (value.value.loginId === originalLoginId.value) {
    return undefined;
  }
  return existsLoginId.value ? undefined : ["사용 가능한 아이디 입니다."];
});

const loginIdAppendIcon = computed((): string | unknown => {
  if (loginIdSuccessText.value) {
    return "mdi-check-circle";
  }
  if (loginIdErrorText.value) {
    return "mdi-alert-circle";
  }
  return undefined;
});

async function save(): Promise<void> {
  const isValid = await observer.value?.validate();
  if (!isValid) {
    return;
  }
  isNew.value ? await create() : await update();
}

async function create(): Promise<void> {
  saving.value = true;
  const response = await postApi<Admin>("admins/", {
    ...{
      ...value.value,
      password: password.value ? SHA512(password.value).toString() : undefined,
    },
  });
  saving.value = false;
  if (response.success) {
    await reloadAdminCodes();
    dialog.value = false;
    emits("created", response.data);
  }
}

async function update(): Promise<void> {
  saving.value = true;
  const response = await patchApi<Admin>(`admins/${value.value.id}`, {
    ...{
      ...value.value,
      password: password.value ? SHA512(password.value).toString() : undefined,
    },
  });
  saving.value = false;
  if (response.success) {
    if (value.value.id === id) {
      await reIssueAccessToken();
    }
    await reloadAdminCodes();
    dialog.value = false;
    emits("updated", response.data);
  }
}

function checkExistsLoginId(): void {
  if (value.value.loginId === originalLoginId.value) {
    return;
  }
  loading.value = true;
  checked.value = false;
  debouncedCheckExistsLoginId();
}

onBeforeMount(() => {
  originalLoginId.value = value.value.loginId;
});
const observer = ref();
</script>
