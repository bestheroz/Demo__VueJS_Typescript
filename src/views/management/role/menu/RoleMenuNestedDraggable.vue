<template>
  <v-list>
    <vuedraggable
      class="dragArea"
      tag="div"
      :list="value"
      :group="{ name: 'g1' }"
      :animation="200"
      handle=".drag-handle"
    >
      <v-list-item dense :key="item.menu.id" v-for="item in value">
        <v-row no-gutters>
          <v-col sm="12" lg="5">
            <v-list-item-icon>
              <v-icon v-text="item.menu.icon" style="top: 4px" />
            </v-list-item-icon>
            <v-list-item-title class="d-inline">
              <v-btn icon v-if="hasWriteAuthority" small>
                <v-icon class="drag-handle"> mdi-sort </v-icon>
              </v-btn>
              {{ item.menu.name }}
            </v-list-item-title>
          </v-col>
          <v-col sm="12" lg="7" class="text-right">
            <v-btn-toggle
              v-model="item.authoritiesJson"
              active-class="primary"
              multiple
              class="transparent"
              v-if="item.menu.type !== MENU_TYPE.GROUP"
            >
              <v-btn
                :value="ROLE_AUTHORITY_TYPE.VIEW"
                disabled
                style="
                  background-color: var(--v-primary-base) !important;
                  color: initial !important;
                "
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.WRITE"
                :disabled="hasWriteAuthority && roleId === adminStore.roleId"
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.WRITE)
                    ? 'primary'
                    : 'transparent'
                "
              >
                <v-icon
                  :color="
                    item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.WRITE)
                      ? undefined
                      : 'secondary'
                  "
                  >mdi-content-save-outline</v-icon
                >
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.DELETE"
                :disabled="hasWriteAuthority && roleId === adminStore.roleId"
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.DELETE)
                    ? 'primary'
                    : 'transparent'
                "
              >
                <v-icon
                  :color="
                    item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.DELETE)
                      ? undefined
                      : 'secondary'
                  "
                  >mdi-delete-outline</v-icon
                >
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.EXCEL"
                :disabled="hasWriteAuthority && roleId === adminStore.roleId"
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.EXCEL)
                    ? 'primary'
                    : 'transparent'
                "
              >
                <v-icon
                  :color="
                    item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.EXCEL)
                      ? undefined
                      : 'secondary'
                  "
                  >mdi-file-excel-outline</v-icon
                >
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" v-if="item.menu.type === MENU_TYPE.GROUP">
            <component
              :is="RoleMenuNestedDraggable"
              v-model="item.children"
              :role-id="roleId"
            />
          </v-col>
        </v-row>
      </v-list-item>
    </vuedraggable>
  </v-list>
</template>
<script setup lang="ts">
import { RoleMenuMap } from "@/definitions/models";
import * as Vuedraggable from "vuedraggable";
import { MENU_TYPE, ROLE_AUTHORITY_TYPE } from "@/definitions/selections";
import { useVModel } from "@vueuse/core";
import RoleMenuNestedDraggable from "@/views/management/role/menu/RoleMenuNestedDraggable.vue";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";

const { hasWriteAuthority } = useAuthorityStore();
const adminStore = useAdminStore();

const props = defineProps<{
  value: RoleMenuMap[];
  roleId: number;
}>();
const emits = defineEmits<{
  (e: "input", v: RoleMenuMap[]): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
</script>
