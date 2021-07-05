<template>
  <div>
    <v-bottom-sheet v-model="syncedDialog" inset scrollable>
      <v-card class="pb-4">
        <dialog-title
          v-model="vModel.available"
          :is-new="isNew"
          prefix="사용자"
          with-switch
          @click:close="syncedDialog = false"
        />
        <v-card-text>
          <ValidationObserver ref="observer">
            <v-row>
              <v-col cols="12" md="3">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="사용자아이디"
                  rules="required|max:50"
                >
                  <v-text-field
                    v-model="vModel.userId"
                    label="*사용자아이디"
                    :counter="50"
                    :error-messages="errors"
                    :disabled="!isNew"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="12" md="3">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="사용자명"
                  rules="required|max:100"
                >
                  <v-text-field
                    v-model="vModel.name"
                    label="*사용자명"
                    :counter="100"
                    :error-messages="errors"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="12" md="3">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="권한"
                  rules="required"
                >
                  <v-select
                    v-if="AuthorityTypes"
                    v-model="vModel.authority"
                    :items="AuthorityTypes"
                    label="*권한"
                    :error-messages="errors"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="12" md="3">
                <datetime-picker
                  v-model="vModel.expired"
                  label="만료일"
                  full-width
                />
              </v-col>
              <v-col cols="12" md="3" v-if="isNew">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="비밀번호"
                  vid="password"
                  rules="max:20"
                >
                  <v-text-field
                    v-model="vModel.password"
                    label="비밀번호"
                    :counter="20"
                    :error-messages="errors"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    @click:append="show1 = !show1"
                  />
                </ValidationProvider>
              </v-col>
              <v-col cols="12" md="3" v-if="$store.getters.writeAuthority">
                <ValidationProvider
                  v-if="isNew"
                  v-slot="{ errors }"
                  name="비밀번호 확인"
                  rules="required|confirmed:password|max:20"
                >
                  <v-text-field
                    v-model="password2"
                    label="*비밀번호 확인"
                    :counter="20"
                    :error-messages="errors"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show2 ? 'text' : 'password'"
                    clearable
                    @click:append="show2 = !show2"
                  />
                </ValidationProvider>
                <v-btn v-else color="primary" outlined @click="resetPassword">
                  비밀번호 초기화
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
            v-if="$store.getters.writeAuthority"
          />
        </v-card-text>
        <created-updated-bar
          :created-date-time="vModel.created"
          :updated-date-time="vModel.updated"
        />
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Ref, VModel, Vue } from "vue-property-decorator";
import { patchApi, postApi } from "@/utils/apis";
import DatetimePicker from "@/components/picker/DatetimePicker.vue";
import { ValidationObserver } from "vee-validate";
import pbkdf2 from "pbkdf2";
import DialogTitle from "@/components/title/DialogTitle.vue";
import type { Member } from "@/definitions/models";
import CreatedUpdatedBar from "@/components/history/CreatedUpdatedBar.vue";
import ButtonWithIcon from "@/components/button/ButtonWithIcon.vue";
import { AuthorityTypes } from "@/definitions/selections";

@Component({
  components: {
    ButtonWithIcon,
    CreatedUpdatedBar,
    DialogTitle,
    DatetimePicker,
  },
})
export default class extends Vue {
  @VModel({ required: true }) vModel!: Member;
  @PropSync("dialog", { required: true, type: Boolean }) syncedDialog!: boolean;
  @Ref("observer") readonly observer!: InstanceType<typeof ValidationObserver>;

  loading = false;
  password2 = "";
  show1 = false;
  show2 = false;
  readonly AuthorityTypes = AuthorityTypes;

  get isNew(): boolean {
    return !this.vModel.id;
  }

  protected async save(): Promise<void> {
    const isValid = await this.observer.validate();
    if (!isValid) {
      return;
    }
    this.isNew ? await this.create() : await this.update();
  }

  protected async create(): Promise<void> {
    this.loading = true;
    const params = { ...this.vModel };
    if (params.password) {
      params.password = pbkdf2
        .pbkdf2Sync(params.password, "salt", 1, 32, "sha512")
        .toString();
    }
    const response = await postApi<Member>("admin/members/", params);
    this.loading = false;
    if (response?.code?.startsWith("S")) {
      await this.$store.dispatch("resetMemberCodes");
      this.syncedDialog = false;
      this.$emit("created", response.data);
    }
  }

  protected async update(): Promise<void> {
    this.loading = true;
    const params = { ...this.vModel };
    if (params.password) {
      params.password = pbkdf2
        .pbkdf2Sync(params.password, "salt", 1, 32, "sha512")
        .toString();
    }
    const response = await patchApi<Member>(
      `admin/members/${this.vModel.id}/`,
      params,
    );
    this.loading = false;
    if (response?.code?.startsWith("S")) {
      if (this.vModel.id === this.$store.getters.user.id) {
        await this.$store.dispatch("reIssueAccessToken");
      }
      await this.$store.dispatch("resetMemberCodes");
      this.syncedDialog = false;
      this.$emit("updated", response.data);
    }
  }

  protected async resetPassword(): Promise<void> {
    this.loading = true;
    await postApi<Member>(
      `admin/members/${this.vModel.id}/resetPassword`,
      this.vModel,
    );
    this.loading = false;
  }
}
</script>
