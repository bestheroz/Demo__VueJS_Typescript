<template>
  <div>
    <v-list-item
      v-if="!menuItem.items"
      :input-value="menuItem.value"
      :to="menuItem.type === MENU_TYPE.P ? menuItem.link : undefined"
      :exact="menuItem.exact"
      :disabled="menuItem.disabled"
      :link="menuItem.type === MENU_TYPE.P"
      @click="
        menuItem.type === MENU_TYPE.W
          ? popupWindow(menuItem.link)
          : $store.commit(
              'setSelectedMenu',
              menuItem.key ? $t(menuItem.key) : menuItem.text,
            )
      "
      active-class="primary--text"
    >
      <v-list-item-icon>
        <v-icon
          :small="small"
          :class="{ 'grey--text': menuItem.disabled }"
          v-text="menuItem.icon || 'mdi-circle-medium'"
        />
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title
          v-text="menuItem.key ? $t(menuItem.key) : menuItem.text"
        />
      </v-list-item-content>
    </v-list-item>

    <v-list-group
      v-else
      :value="menuItem.regex ? menuItem.regex.test($route.path) : false"
      :disabled="menuItem.disabled"
      :sub-group="subgroup"
      :to="menuItem.type === MENU_TYPE.P ? menuItem.link : undefined"
      @click="
        menuItem.type === MENU_TYPE.W ? popupWindow(menuItem.link) : undefined
      "
      :link="menuItem.type === MENU_TYPE.P"
    >
      <template #activator>
        <v-list-item-icon v-if="!subgroup">
          <v-icon
            :small="small"
            v-text="menuItem.icon || 'mdi-circle-medium'"
          />
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title
            v-text="menuItem.key ? $t(menuItem.key) : menuItem.text"
          />
        </v-list-item-content>
      </template>
      <slot />
    </v-list-group>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import type { Drawer } from "@/definitions/types";
import { MENU_TYPE } from "@/definitions/selections";

@Component({})
export default class extends Vue {
  @Prop({ default: () => Object.create(null) }) readonly menuItem!: Drawer;
  @Prop({ type: Boolean }) readonly subgroup!: boolean;
  @Prop({ type: Boolean }) readonly small!: boolean;

  readonly MENU_TYPE = MENU_TYPE;

  protected popupWindow(url: string): void {
    window.open(
      url,
      "_blank",
      // 'location=false,menubar=false,scrollbars=true,status=false,toolbar=false',
    );
  }
}
</script>
