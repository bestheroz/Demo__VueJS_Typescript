<template>
  <v-list nav dense class="py-0">
    <!-- menu level 1 -->
    <NavMenuItem
      v-for="drawer in drawers"
      :key="drawer.id"
      :drawer="drawer"
      :depth="depth"
    >
      <template>
        <component
          :is="NavMenu"
          :drawers="drawer.children"
          :depth="depth + 1"
        />
      </template>
    </NavMenuItem>
  </v-list>
</template>

<script setup lang="ts">
import NavMenu from "@/components/navigation/NavMenu.vue";
import NavMenuItem from "@/components/navigation/NavMenuItem.vue";
import { Drawer } from "@/definitions/types";

withDefaults(
  defineProps<{
    drawers?: Drawer[] | null;
    depth?: number;
  }>(),
  { drawers: () => [], depth: 0 },
);
</script>
