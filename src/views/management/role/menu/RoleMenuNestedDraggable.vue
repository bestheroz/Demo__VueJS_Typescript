<template>
  <v-list :class="{ 'ml-9': !rootFlag }">
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
      <v-list-item v-for="item in value" :key="item.menu.id" dense class="pr-0">
        <v-row no-gutters>
          <v-col sm="12" lg="5">
            <v-list-item-icon>
              <v-icon style="top: 4px" v-text="item.menu.icon" />
            </v-list-item-icon>
            <v-list-item-title class="d-inline">
              <v-btn v-if="hasWriteAuthority" icon small>
                <v-icon class="drag-handle"> mdi-sort </v-icon>
              </v-btn>
              {{ item.menu.name }}
            </v-list-item-title>
          </v-col>
          <v-col sm="12" lg="7" class="text-right">
            <v-btn-toggle
              v-if="item.menu.type !== MENU_TYPE.GROUP"
              v-model="item.authoritiesJson"
              active-class="primary"
              tile
              multiple
              class="transparent"
            >
              <v-btn
                :value="ROLE_AUTHORITY_TYPE.VIEW"
                disabled
                style="
                  background-color: var(--v-primary-base) !important;
                  color: white !important;
                "
              >
                보기
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.WRITE"
                :disabled="hasWriteAuthority && roleId === adminStore.roleId"
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.WRITE)
                    ? 'white--text'
                    : 'text--secondary'
                "
              >
                편집
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.DELETE"
                :disabled="hasWriteAuthority && roleId === adminStore.roleId"
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.DELETE)
                    ? 'white--text'
                    : 'text--secondary'
                "
              >
                삭제
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.EXCEL"
                :disabled="hasWriteAuthority && roleId === adminStore.roleId"
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.EXCEL)
                    ? 'white--text'
                    : 'text--secondary'
                "
              >
                엑셀
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col v-if="item.menu.type === MENU_TYPE.GROUP" cols="12">
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
import type { RoleMenuMap } from "@/definitions/models";
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
  rootFlag?: boolean;
}>();
const emits = defineEmits<{
  (e: "input", v: RoleMenuMap[]): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
</script>
