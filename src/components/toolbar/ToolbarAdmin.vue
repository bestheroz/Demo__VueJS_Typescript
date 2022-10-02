<template>
  <div>
    <v-menu offset-y left transition="slide-y-transition">
      <template #activator="{ on }">
        <v-btn icon class="elevation-2" v-on="on">
          <v-badge color="success" dot bordered offset-x="10" offset-y="10">
            <v-avatar size="40">
              <v-img src="/src/assets/images/avatars/avatar1.svg" />
            </v-avatar>
          </v-badge>
        </v-btn>
      </template>

      <v-list dense nav>
        <v-list-item
          v-for="(item, index) in menu"
          :key="index"
          link
          @click="getActions(item)"
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="signOut">
          <v-list-item-icon>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> 로그아웃 </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <EditMeDialog
      v-if="editMeDialog"
      :dialog.sync="editMeDialog"
      :admin-password="adminEncodedPassword"
    />
    <EditPasswordDialog
      v-if="editMePasswordDialog"
      :dialog.sync="editMePasswordDialog"
    />
    <ToolbarTheme v-model="toolbarThemeDialog" />
  </div>
</template>

<script setup lang="ts">
import config from "../../configs";
import { signOut } from "@/utils/commands";
import { promptPassword, toastError } from "@/utils/alerts";
import { postApi } from "@/utils/apis";
import { ref } from "vue";
import { SHA512 } from "crypto-js";
import EditMeDialog from "@/views/components/EditMeDialog.vue";
import EditPasswordDialog from "@/views/components/EditPasswordDialog.vue";
import ToolbarTheme from "@/components/config/ToolbarTheme.vue";
import { storeToRefs } from "pinia";
import { useAdminStore } from "@/stores/admin";

const { name } = storeToRefs(useAdminStore());

const menu = ref(config.toolbar.admin);
const editMeDialog = ref(false);
const editMePasswordDialog = ref(false);
const toolbarThemeDialog = ref(false);
const adminEncodedPassword = ref("");

function getActions(item: { key: string }): void {
  switch (item.key) {
    case "adminmenu.profile":
      confirmPassword();
      break;
    case "adminmenu.changePassword":
      editMePasswordDialog.value = true;
      break;
    case "adminmenu.theme":
      toolbarThemeDialog.value = true;
      break;
  }
}

async function confirmPassword(): Promise<void> {
  const adminPassword = await promptPassword(
    "내 정보 확인/수정",
    name.value + " 님의 정보확인을 위해 비밀번호를 입력 해 주세요",
  );

  if (!adminPassword) {
    return;
  }

  const adminEncodedPassword_ = SHA512(adminPassword).toString();

  const response = await postApi<void>(
    "mine/verify-password",
    adminEncodedPassword_,
    false,
  );
  if (response.success) {
    adminEncodedPassword.value = adminEncodedPassword_; // edit-me-dialog로 넘길 사용자 인코딩 패스워드
    editMeDialog.value = true;
  } else {
    toastError(response.message);
  }
}
</script>
