<template>
  <v-list nav dense>
    <div v-for="(item, index) in $store.getters.drawers" :key="index">
      <div v-if="item.text" class="pa-1 mt-2 overline" v-text="item.text" />
      <nav-menu :menu="item.items" />
    </div>
  </v-list>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavMenu from "@/components/navigation/NavMenu.vue";

@Component({
  components: {
    NavMenu,
  },
})
export default class extends Vue {}
</script>
