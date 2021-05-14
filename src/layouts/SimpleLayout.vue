<template>
  <div
    class="
      pa-2 pa-md-4
      flex-grow-1
      align-center
      justify-center
      d-flex
      flex-column
    "
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class extends Vue {}
</script>
