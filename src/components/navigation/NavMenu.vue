<template>
  <div>
    <!-- menu level 1 -->
    <nav-menu-item
      v-for="(level1Item, level1Index) in menu"
      :key="level1Index"
      :menu-item="level1Item"
    >
      <template v-if="level1Item.items">
        <!-- menu level 2 -->
        <nav-menu-item
          v-for="(level2Item, level2Index) in level1Item.items"
          :key="level2Index"
          :menu-item="level2Item"
          subgroup
          small
        >
          <template v-if="level2Item.items">
            <!-- menu level 3 -->
            <nav-menu-item
              v-for="(level3Item, level3Index) in level2Item.items"
              :key="level3Index"
              :menu-item="level3Item"
              small
            />
          </template>
        </nav-menu-item>
      </template>
    </nav-menu-item>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NavMenuItem from "@/components/navigation/NavMenuItem.vue";
import { Drawer } from "@/definitions/types";

@Component({
  components: { NavMenuItem },
})
export default class extends Vue {
  @Prop({ default: () => [] }) readonly menu!: Drawer[];
}
</script>
