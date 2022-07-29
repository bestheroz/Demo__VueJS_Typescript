<template>
  <div>
    <v-navigation-drawer
      v-model="value"
      fixed
      right
      hide-overlay
      temporary
      app
      width="330"
    >
      <div class="d-flex align-center pa-2">
        <div class="text-h6">Settings</div>
        <v-spacer />
        <v-btn icon @click="value = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <div class="pa-2">
        <div class="font-weight-bold my-1">Global Theme</div>
        <v-btn-toggle
          v-model="globalTheme"
          color="primary"
          mandatory
          class="mb-2"
        >
          <v-btn x-large value="light"> Light </v-btn>
          <v-btn x-large value="dark"> Dark </v-btn>
        </v-btn-toggle>

        <div class="font-weight-bold my-1">Toolbar Theme</div>
        <v-btn-toggle
          v-model="toolbarTheme"
          color="primary"
          mandatory
          class="mb-2"
        >
          <v-btn x-large value="global"> Global </v-btn>
          <v-btn x-large value="light"> Light </v-btn>
          <v-btn x-large value="dark"> Dark </v-btn>
        </v-btn-toggle>

        <div class="font-weight-bold my-1">Menu Theme</div>
        <v-btn-toggle
          v-model="menuTheme"
          color="primary"
          mandatory
          class="mb-2"
        >
          <v-btn x-large value="global"> Global </v-btn>
          <v-btn x-large value="light"> Light </v-btn>
          <v-btn x-large value="dark"> Dark </v-btn>
        </v-btn-toggle>

        <div class="font-weight-bold my-1">Toolbar Style</div>
        <v-btn-toggle
          v-model="toolbarDetached"
          color="primary"
          mandatory
          class="mb-2"
        >
          <v-btn x-large :value="false"> Full </v-btn>
          <v-btn x-large :value="true"> Solo </v-btn>
        </v-btn-toggle>

        <div class="font-weight-bold my-1">Content Layout</div>
        <v-btn-toggle
          v-model="contentBoxed"
          color="primary"
          mandatory
          class="mb-2"
        >
          <v-btn x-large :value="false"> Fluid </v-btn>
          <v-btn x-large :value="true"> Boxed </v-btn>
        </v-btn-toggle>

        <div class="font-weight-bold my-1">Primary Color</div>

        <v-color-picker v-model="primaryColor" mode="hexa" show-swatches />
        <v-btn
          v-text="'Reset All'"
          block
          large
          color="primary"
          class="my-4"
          @click="resetDefaultConfig"
        />
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { uploadConfig } from "@/utils/commands";
import { useConfigStore } from "@/stores/config";

const props = defineProps<{ value: boolean }>();
const emits = defineEmits<{
  (e: "input", v: boolean): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });

const configStore = useConfigStore();
const {
  globalTheme,
  primaryColor,
  menuTheme,
  toolbarTheme,
  toolbarDetached,
  contentBoxed,
} = storeToRefs(configStore);
const { resetDefaultConfig } = configStore;
configStore.$subscribe((_mutation, state) => {
  uploadConfig(state);
});
</script>

<style lang="scss" scoped>
.drawer-button {
  position: fixed;
  top: 340px;
  right: -20px;
  z-index: 6;
  box-shadow: 1px 1px 18px #ee44aa;

  .v-icon {
    margin-left: -18px;
    font-size: 1.3rem;
  }
}
</style>
