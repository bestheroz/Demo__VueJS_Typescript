<template>
  <div>
    <v-bottom-sheet v-model="syncedDialog" inset scrollable max-width="35vw">
      <v-card class="pb-4">
        <dialog-title text="내 정보 변경" @click:close="syncedDialog = false" />
        <v-card-text>
          <ValidationObserver ref="observer">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="item.userId"
                  label="사용자아이디"
                  :counter="50"
                  disabled
                />
              </v-col>
              <v-col cols="12">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="사용자명"
                  rules="required|max:100"
                >
                  <v-text-field
                    v-model="item.name"
                    label="*사용자명"
                    :counter="100"
                    :error-messages="errors"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="7">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="비밀번호"
                  rules="required|max:20"
                >
                  <v-text-field
                    v-model="item.password"
                    label="*비밀번호"
                    :counter="20"
                    :error-messages="errors"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    @click:append="show1 = !show1"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="5" class="text-right">
                <v-btn
                  color="primary"
                  outlined
                  @click="newPasswordDialog = true"
                >
                  비밀번호 변경
                </v-btn>
              </v-col>
            </v-row>
          </ValidationObserver>
          <button-with-icon
            block
            text="저장"
            icon="mdi-content-save"
            :loading="loading"
            @click="save"
          />
        </v-card-text>
        <created-updated-bar
          :created-date-time="item.created"
          :updated-date-time="item.updated"
        />
      </v-card>
    </v-bottom-sheet>
    <change-password-dialog
      :dialog.sync="newPasswordDialog"
      v-if="newPasswordDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Ref, Vue } from "vue-property-decorator";
import { getApi, patchApi } from "@/utils/apis";
import ChangePasswordDialog from "@/views/components/ChangePasswordDialog.vue";
import { ValidationObserver } from "vee-validate";
import pbkdf2 from "pbkdf2";
import DialogTitle from "@/components/title/DialogTitle.vue";
import { defaultMember } from "@/definitions/defaults";
import type { Member } from "@/definitions/models";
import CreatedUpdatedBar from "@/components/history/CreatedUpdatedBar.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";

@Component({
  components: {
    ButtonWithIcon,
    CreatedUpdatedBar,
    DialogTitle,
    ChangePasswordDialog,
  },
})
export default class extends Vue {
  @PropSync("dialog", { required: true, type: Boolean }) syncedDialog!: boolean;
  @Ref("observer") readonly observer!: InstanceType<typeof ValidationObserver>;

  item: Member = defaultMember();
  loading = false;
  show1 = false;
  newPasswordDialog = false;

  protected async created(): Promise<void> {
    const response = await getApi<Member>("members/mine");
    this.item = response?.data || defaultMember();
  }

  protected async save(): Promise<void> {
    const isValid = await this.observer.validate();
    if (!isValid) {
      return;
    }

    this.loading = true;
    const payload = { ...this.item };
    payload.password = pbkdf2
      .pbkdf2Sync(this.item.password || "", "salt", 1, 32, "sha512")
      .toString();
    const response = await patchApi<Member>("members/mine", payload);
    this.loading = false;
    if (response?.code?.startsWith("S")) {
      await this.$store.dispatch("reIssueAccessToken");
      await this.$store.dispatch("resetMemberCodes");
      this.syncedDialog = false;
    }
  }
}
</script>
