<template>
  <div>
    <v-simple-table fixed-header class="sortableTable">
      <template #default>
        <thead>
          <tr>
            <th class="text-left">코드</th>
            <th class="text-left">코드명</th>
            <th class="text-center">사용 가능</th>
            <th class="text-center">작업 일시</th>
            <th class="text-left">작업자</th>
            <th class="text-center" v-if="$store.getters.writeAuthority">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0 && !loading">
            <td :colspan="6" class="text-center">
              <span class="grey--text">데이터가 없습니다.</span>
            </td>
          </tr>
          <tr
            v-for="item in items"
            :key="item.value"
            class="sortableTable"
            v-else
          >
            <td>
              <v-btn icon v-if="$store.getters.writeAuthority">
                <v-icon class="drag-handle"> mdi-sort</v-icon>
              </v-btn>
              <a
                class="text--anchor"
                @click="showEditDialog({ ...item })"
                v-text="item.value"
              />
            </td>
            <td v-text="item.text" />
            <td class="text-center">
              <checkbox-marker :value="item.available" />
            </td>
            <td class="text-center">
              {{ item.updated | formatDatetime }}
            </td>
            <td>
              {{ item.updatedBy | formatAdminNm }}
            </td>
            <td class="text-center my-0" v-if="$store.getters.deleteAuthority">
              <div class="actions">
                <v-btn icon @click="remove(item)">
                  <v-icon color="error"> mdi-delete-outline</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <code-edit-dialog
      v-model="editItem"
      :dialog.sync="dialog"
      @created="onCreated"
      @updated="onUpdated"
      v-if="dialog"
    />
  </div>
</template>

<script lang="ts">
import { deleteApi, patchApi } from "@/utils/apis";
import CodeEditDialog from "@/views/management/code/CodeEditDialog.vue";
import { confirmDelete } from "@/utils/alerts";
import { defaultCode } from "@/definitions/defaults";
import type { Code, UpdateDisplayOrder } from "@/definitions/models";
import { defineComponent, onMounted, watch } from "@vue/composition-api";
import setupListDialog from "@/composition/setupListDialog";
import setupListPage from "@/composition/setupList";
import CheckboxMarker from "@/components/datatable/CheckboxMarker.vue";
import Sortable, { SortableEvent } from "sortablejs";

export default defineComponent({
  components: { CheckboxMarker, CodeEditDialog },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit, root }) {
    const listPage = setupListPage<Code>(`codes/?type=${props.type}`);
    const listDialog = setupListDialog<Code>(() => ({
      ...defaultCode(),
      type: props.type,
      displayOrder: listPage.items.value.length + 1,
    }));

    const methods = {
      saveItems: async (): Promise<void> => {
        listPage.loading.value = true;
        const response = await patchApi<Code[]>(
          `codes/display-orders/?type=${props.type}`,
          listPage.items.value.map(
            ({ id }, index): UpdateDisplayOrder => ({
              id: id as number,
              displayOrder: index + 1,
            }),
          ),
        );
        listPage.loading.value = false;
        if (response.success) {
          window.sessionStorage.removeItem(`code__${props.type}`);
          listPage.items.value = response.data || [];
        }
      },
      remove: async (value: Code): Promise<void> => {
        const result = await confirmDelete(`코드: ${value.value}`);
        if (result) {
          listPage.loading.value = true;
          const response = await deleteApi<Code>(`codes/${value.id}`);
          listPage.loading.value = false;
          if (response.success) {
            window.sessionStorage.removeItem(`code__${value.type}`);
            listPage.items.value = listPage.items.value.filter(
              (item) => item.id !== value.id,
            );
            if (listPage.items.value.length === 0) {
              emit("removed", value);
            }
          }
        }
      },
      onCreated: (value: Code): void => {
        if (props.type === value.type) {
          listPage.items.value = [value, ...listPage.items.value];
        } else {
          emit("created", value);
        }
      },
      getList: (): void => {
        listPage.fetchList.value();
      },
    };
    watch(
      () => props.type,
      () => {
        listPage.url.value = `codes/?type=${props.type}`;
        listPage.fetchList.value();
      },
    );
    onMounted(() => {
      const querySelector = root.$el.querySelector(
        ".sortableTable tbody",
      ) as HTMLElement;
      Sortable.create(querySelector, {
        handle: ".drag-handle",
        animation: 500,
        onEnd(evt: SortableEvent) {
          if (
            evt.oldIndex !== undefined &&
            evt.newIndex !== undefined &&
            evt.newIndex != evt.oldIndex
          ) {
            const newArray = [...listPage.items.value];
            const rowSelected = newArray.splice(evt.oldIndex, 1)[0];
            newArray.splice(evt.newIndex, 0, rowSelected);
            listPage.items.value = newArray;
          }
        },
      });
    });
    return { ...listDialog, ...listPage, ...methods };
  },
});
</script>
