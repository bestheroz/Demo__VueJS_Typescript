<template>
  <div>
    <v-bottom-sheet v-model="dialog" inset scrollable>
      <v-card class="pb-4">
        <DialogTitle
          :is-new="isNew"
          prefix="메뉴"
          @click:close="dialog = false"
        />
        <v-card-text>
          <v-form :readonly="!hasWriteAuthority">
            <validation-observer ref="observer">
              <v-row>
                <v-col cols="12" md="3">
                  <validation-provider
                    v-slot="{ errors }"
                    name="메뉴명"
                    rules="required|max:50"
                  >
                    <v-text-field
                      v-model="value.name"
                      label="메뉴명"
                      :counter="50"
                      :error-messages="errors"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="3">
                  <validation-provider
                    v-slot="{ errors }"
                    name="타입"
                    rules="required"
                  >
                    <v-select
                      v-model="value.type"
                      :items="MenuTypes"
                      label="타입"
                      :error-messages="errors"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
                <v-col cols="12" md="6" v-if="value.type !== MENU_TYPE.GROUP">
                  <validation-provider
                    v-slot="{ errors }"
                    name="링크 URL"
                    rules="max:255"
                  >
                    <v-text-field
                      v-model="value.url"
                      label="링크 URL"
                      :counter="255"
                      :error-messages="errors"
                      clearable
                    />
                  </validation-provider>
                </v-col>
                <v-col v-if="value.type === MENU_TYPE.GROUP" cols="12" md="4">
                  <validation-provider
                    v-slot="{ errors }"
                    name="메뉴 아이콘"
                    rules="max:50|required"
                  >
                    <v-text-field
                      v-model="value.icon"
                      label="메뉴 아이콘"
                      append-icon="mdi-open-in-new"
                      :counter="50"
                      :error-messages="errors"
                      @click:append="linkIconSite"
                      class="required"
                    />
                  </validation-provider>
                </v-col>
                <v-col v-if="value.type === MENU_TYPE.GROUP" cols="12" md="1">
                  <v-icon v-text="value.icon" size="3.5rem" />
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
import { postApi, putApi } from "@/utils/apis";
import { ValidationObserver } from "vee-validate";
import DialogTitle from "@/components/title/DialogTitle.vue";
import type { Menu } from "@/definitions/models";
import CreatedUpdatedBar from "@/components/history/CreatedUpdatedBar.vue";
import { MENU_TYPE, MenuTypes } from "@/definitions/selections";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import useEditDialog from "@/composition/useEditDialog";
import { ref } from "vue";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority, reloadRole } = useAuthorityStore();
const props = defineProps<{
  value: Menu;
  dialog: boolean;
}>();

const emits = defineEmits<{
  (e: "created", v: Menu): void;
  (e: "updated", v: Menu): void;
  (e: "update:dialog", v: boolean): void;
  (e: "input", v: Menu): void;
}>();

const { dialog, loading, isNew, value } = useEditDialog<Menu>(
  props,
  emits,
  "menus/",
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
  const response = await postApi<Menu>("menus/", value.value);
  loading.value = false;
  if (response.success) {
    reloadRole().then();
    dialog.value = false;
    emits("created", response.data);
  }
}

async function update(): Promise<void> {
  loading.value = true;
  const response = await putApi<Menu>(`menus/${value.value.id}`, value.value);
  loading.value = false;
  if (response.success) {
    reloadRole().then();
    dialog.value = false;
    emits("updated", response.data);
  }
}

function linkIconSite(): void {
  window.open("https://pictogrammers.github.io/@mdi/font/6.5.95/", "_blank");
}
const observer = ref();
</script>
