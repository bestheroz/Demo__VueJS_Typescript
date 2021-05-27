<template>
  <div class="w-full">
    <menu-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MenuList from "@/views/admin/menu/MenuList.vue";

@Component({
  components: {
    MenuList,
  },
})
export default class extends Vue {}
</script>
