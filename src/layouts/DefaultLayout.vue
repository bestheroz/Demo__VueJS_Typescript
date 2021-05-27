<template>
  <div class="d-flex flex-grow-1">
    <!-- Navigation -->
    <v-navigation-drawer
      v-model="drawer"
      app
      floating
      class="elevation-1"
      :right="$vuetify.rtl"
      :light="$store.getters.menuTheme === 'light'"
      :dark="$store.getters.menuTheme === 'dark'"
    >
      <!-- Navigation menu info -->
      <template #prepend>
        <div class="pa-2">
          <div
            class="title font-weight-bold primary--text"
            v-text="envs.PRODUCT_TITLE"
          />
          <div
            class="overline grey--text"
            v-text="envs.PRODUCT_VERSION"
            style="text-transform: none"
          />
        </div>
      </template>

      <!-- Navigation menu -->
      <main-menu />
    </v-navigation-drawer>

    <!-- Toolbar -->
    <v-system-bar
      app
      :color="toolbarTheme === 'light' ? 'white' : 'dark'"
      :light="toolbarTheme === 'light'"
      :dark="toolbarTheme === 'dark'"
      height="30"
    >
      <v-subheader>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        {{ title || "" }}
      </v-subheader>
      <button-icon-tooltip
        icon-style
        text="홈으로"
        icon="mdi-home-outline"
        @click="goHome"
      />
      <button-icon-tooltip
        icon-style
        text="Theme"
        icon="mdi-palette"
        @click="toolbarThemeDialog = true"
      />
      <button-icon-tooltip
        icon-style
        text="내 정보수정"
        icon="mdi-account-edit-outline"
        @click="editMeDialog = true"
      />
      <button-icon-tooltip
        icon-style
        text="Logout"
        icon="mdi-logout"
        @click="logout"
      />
      <v-spacer />
      <v-subheader class="pl-0">
        <v-icon> mdi-account-outline</v-icon>
        {{ $store.getters.user.name }}
      </v-subheader>
      <v-subheader class="pl-0" v-text="now" />
    </v-system-bar>
    <edit-me-dialog :dialog.sync="editMeDialog" v-if="editMeDialog" />
    <toolbar-theme v-model="toolbarThemeDialog" />

    <v-main>
      <v-container class="fill-height" :fluid="!$store.getters.isContentBoxed">
        <v-layout>
          <slot />
        </v-layout>
      </v-container>

      <v-footer app inset>
        <v-spacer />
        <div class="overline">
          <a
            class="text-decoration-none"
            href="https://github.com/bestheroz"
            target="_blank"
          >
            @bestheroz
          </a>
          <v-icon small color="pink"> mdi-heart </v-icon>
        </div>
      </v-footer>
    </v-main>
  </div>
</template>

<script lang="ts">
import MainMenu from "../components/navigation/MainMenu.vue";
import { Component, Vue, Watch } from "vue-property-decorator";
import envs from "@/constants/envs";
import ButtonIconTooltip from "@/components/button/ButtonIconTooltip.vue";
import dayjs from "dayjs";
import { logout } from "@/utils/commands";
import EditMeDialog from "@/views/components/EditMeDialog.vue";
import ToolbarTheme from "@/components/config/ToolbarTheme.vue";

@Component({
  components: {
    ToolbarTheme,
    EditMeDialog,
    ButtonIconTooltip,
    MainMenu,
  },
})
export default class extends Vue {
  drawer = null;

  title = "";
  editMeDialog = false;
  toolbarThemeDialog = false;
  interval: number | null = null;
  now = "";

  readonly envs = envs;
  readonly logout = logout;

  get toolbarTheme(): string {
    if (this.$store.getters.toolbarTheme === "global") {
      return this.$store.getters.globalTheme;
    }
    return this.$store.getters.toolbarTheme;
  }

  protected beforeDestroy(): void {
    this.interval && clearInterval(this.interval);
    this.interval = null;
    this.$nextTick(() => {
      this.interval && clearInterval(this.interval);
      this.interval = null;
    });
  }
  protected async created(): Promise<void> {
    this.title = envs.PRODUCT_TITLE;
    this.now = dayjs().format("YYYY년 MM월 DD일 HH시 mm분 ss초");
    this.interval = window.setInterval(() => {
      this.now = dayjs().format("YYYY년 MM월 DD일 HH시 mm분 ss초");
    }, 1000);
  }

  @Watch("$store.getters.selectedMenuName")
  protected async watchTitle(val: string): Promise<void> {
    document.title = this.title + `:: ${val}`;
  }

  protected goHome(): void {
    this.$router.currentRoute.path !== "/" && this.$router.push("/");
  }
}
</script>
