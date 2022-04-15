<template>
  <div>
    <div class="text-right mr-4 text--secondary" style="opacity: 0.7">
      <span v-if="createdDateTimeString">
        Created by
        {{ createdBy | formatAdminNm }}
        <v-icon size="1rem" style="vertical-align: initial" class="ml-1">
          mdi-clock-outline
        </v-icon>
        {{ createdDateTimeString }}
      </span>
      <span
        class="px-2 grey--text text--darken-1"
        v-if="createdDateTimeString && updatedDateTimeString"
        >|</span
      >
      <span v-if="updatedDateTimeString">
        Updated by
        {{ updatedBy | formatAdminNm }}
        <v-icon size="1rem" style="vertical-align: initial" class="ml-1">
          mdi-clock-check-outline
        </v-icon>
        {{ updatedDateTimeString }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { formatDatetime } from "@/utils/formatter";
import { computed, defineComponent, PropType } from "@vue/composition-api";
import { DateTime } from "@/definitions/types";

export default defineComponent({
  props: {
    createdBy: {
      type: Number,
      default: undefined,
    },
    createdDateTime: {
      type: [String, Number, Date, Object] as PropType<DateTime>,
      default: undefined,
    },
    updatedBy: {
      type: Number,
      default: undefined,
    },
    updatedDateTime: {
      type: [String, Number, Date, Object] as PropType<DateTime>,
      default: undefined,
    },
  },
  setup(props) {
    const computes = {
      createdDateTimeString: computed((): string => {
        if (!props.createdDateTime) {
          return "";
        }
        return formatDatetime(props.createdDateTime);
      }),
      updatedDateTimeString: computed((): string => {
        if (!props.updatedDateTime) {
          return "";
        }
        return formatDatetime(props.updatedDateTime);
      }),
    };
    return { ...computes };
  },
});
</script>
