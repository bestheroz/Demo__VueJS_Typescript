<template>
  <div>
    <v-icon v-if="value" color="primary"> mdi-check-circle </v-icon>
    <v-icon v-else color="secondary"> mdi-circle-outline</v-icon>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    value: { type: Boolean },
  },
});
</script>
