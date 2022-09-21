<template>
  <v-list :class="{ 'ml-8': !rootFlag }">
    <vuedraggable
      class="dragArea"
      tag="div"
      :list="value"
      :group="{ name: 'g1' }"
      :animation="200"
      handle=".drag-handle"
      :scroll-sensitivity="200"
      :force-fallback="true"
      :style="`${value.length === 0 ? 'border-style: dotted' : ''}`"
    >
      <v-list-item
        v-for="role in value"
        :key="role.id"
        :class="role.id === 1 ? 'd-none' : undefined"
        dense
        style="box-shadow: none"
        class="pr-0"
      >
        <v-list-item-title v-if="role.id !== 1" class="d-inline">
          <div>
            <v-btn v-if="hasWriteAuthority" icon>
              <v-icon class="drag-handle"> mdi-sort</v-icon>
            </v-btn>
            <a
              class="text--anchor"
              @click="emits('click:edit', role)"
              v-text="role.name"
            />
            <v-btn icon @click="emits('remove-role', role)">
              <v-icon color="error"> mdi-delete-outline </v-icon>
            </v-btn>
          </div>
          <component
            :is="RoleNestedDraggable"
            v-model="role.children"
            @click:edit="(item) => emits('click:edit', item)"
            @remove-role="(item) => emits('remove-role', item)"
          />
        </v-list-item-title>
      </v-list-item>
    </vuedraggable>
  </v-list>
</template>
<script setup lang="ts">
import { Role } from "@/definitions/models";
import * as Vuedraggable from "vuedraggable";
import RoleNestedDraggable from "@/views/management/role/RoleNestedDraggable.vue";
import { useVModel } from "@vueuse/core";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority } = useAuthorityStore();
const props = withDefaults(
  defineProps<{ value: Role[]; rootFlag?: boolean }>(),
  {
    value: () => [],
  },
);
const emits = defineEmits<{
  (e: "input", v: Role[]): void;
  (e: "click:edit", v: Role): void;
  (e: "remove-role", v: Role): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
</script>
