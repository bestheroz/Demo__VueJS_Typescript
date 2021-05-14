<template>
  <div class="w-full">
    <member-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MemberList from "@/views/admin/member/MemberList.vue";

@Component({
  components: { MemberList },
})
export default class extends Vue {}
</script>
