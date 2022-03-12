<template>
  <v-list>
    <draggable
      class="dragArea"
      tag="div"
      :list="vModel"
      :group="{ name: 'g1' }"
      :animation="200"
      handle=".drag-handle"
    >
      <v-list-item
        :key="role.id"
        v-for="role in vModel"
        :class="role.id === 1 ? 'd-none' : undefined"
      >
        <v-list-item-title class="d-inline" v-if="role.id !== 1">
          <v-btn icon v-if="$store.getters.writeAuthority">
            <v-icon class="drag-handle"> mdi-sort </v-icon>
          </v-btn>
          <a
            class="text--anchor"
            @click="$emit('click:edit', role)"
            v-text="role.name"
          />
          <role-nested-draggable
            v-model="role.children"
            @click:edit="(item) => $emit('click:edit', item)"
            @click:delete="(item) => $emit('click:delete', item)"
          />
        </v-list-item-title>
      </v-list-item>
    </draggable>
  </v-list>
</template>
<script lang="ts">
import { Role } from "@/definitions/models";
import draggable from "vuedraggable";
import { computed, defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "RoleNestedDraggable",
  components: { draggable },
  props: {
    value: {
      type: Array as PropType<Role[]>,
      required: true,
      default: () => [] as Role[],
    },
  },
  setup(props, { emit }) {
    const computes = {
      vModel: computed({
        get(): Role[] {
          return props.value;
        },
        set(value: Role[]) {
          emit("input", value);
        },
      }),
    };
    return { ...computes };
  },
});
</script>
