<template>
  <div class="d-flex align-center pb-1">
    <div class="text-h4 pl-1 text--secondary" v-text="computedTitle" />
    <v-spacer />
    <v-menu
      v-if="!hideMoreActions"
      content-class="page-title-menu"
      left
      transition="slide-x-reverse-transition"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          icon
          plain
          x-large
          :loading="buttonLoading"
          v-bind="attrs"
          class="mr-1"
          color="secondary"
          v-on="on"
        >
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list style="margin-top: 11px; margin-right: 1rem; padding: 1px">
        <slot name="more-buttons" />
      </v-list>
    </v-menu>
    <ButtonIconTooltip
      v-if="!hideButton && hasWriteAuthority"
      :text="buttonText"
      :icon="buttonIcon"
      :loading="buttonLoading"
      class-name="px-2 mr-1"
      large
      @click="$emit('click')"
    />
  </div>
</template>

<script setup lang="ts">
import ButtonIconTooltip from "@/components/button/ButtonIconTooltip.vue";
import type { RoleMenuMap } from "@/definitions/models";
import { computed } from "vue";
import router from "@/router";
import { storeToRefs } from "pinia";
import { useAuthorityStore } from "@/stores/authority";

const authorityStore = useAuthorityStore();
const { hasWriteAuthority } = authorityStore;
const { flatAuthorities } = storeToRefs(authorityStore);

const props = withDefaults(
  defineProps<{
    title?: string;
    buttonText?: string;
    buttonLoading?: boolean;
    buttonIcon?: string;
    hideMoreActions?: boolean;
    hideButton?: boolean;
  }>(),
  { title: undefined, buttonText: "추가", buttonIcon: "mdi-plus" },
);

const computedTitle = computed(
  (): string =>
    props.title ??
    flatAuthorities.value.find(
      (f: RoleMenuMap) => f.menu.url === router.app?.$route?.path,
    )?.menu.name ??
    "",
);
</script>
