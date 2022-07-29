<template>
  <div class="w-full">
    <v-card>
      <v-card-title> DatePicker.vue </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="3">
            <v-subheader>
              parse Date
              <br />
              {{ now }}}
            </v-subheader>
          </v-col>
          <v-col cols="4" class="text-right">
            <DatePicker v-model="date" clearable required />
          </v-col>
          <v-col cols="5">
            <span>
              typeof =>
              {{ getType(date) }}
              <br />
              {{ date }}
            </span>
          </v-col>
          <v-col cols="3">
            <v-subheader>
              parse string
              <br />
              {{ now.toISOString() }}
            </v-subheader>
          </v-col>
          <v-col cols="4" class="text-right">
            <DatePicker v-model="dateParseISOString" />
          </v-col>
          <v-col cols="5">
            <span>
              typeof =>
              {{ getType(dateParseISOString) }}
              <br />
              {{ dateParseISOString }}
            </span>
          </v-col>
          <v-col cols="3">
            <v-subheader>
              parse number
              <br />
              {{ now.getTime() }}
            </v-subheader>
          </v-col>
          <v-col cols="4" class="text-right">
            <DatePicker v-model="dateParseNumber" />
          </v-col>
          <v-col cols="5">
            <span>
              typeof =>
              {{ getType(dateParseNumber) }}
              <br />
              {{ dateParseNumber }}
            </span>
          </v-col>
          <v-divider class="mr-1" />
        </v-row>
      </v-card-text>
      <v-card-title> DatetimePicker.vue </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="3">
            <v-subheader>
              parse Date
              <br />
              {{ now }}}
            </v-subheader>
          </v-col>
          <v-col cols="4" class="text-right">
            <datetime-picker v-model="date2" required clearable />
          </v-col>
          <v-col cols="5">
            <span>
              typeof =>
              {{ getType(date2) }}
              <br />
              {{ date2 }}
            </span>
          </v-col>
          <v-col cols="3">
            <v-subheader>
              parse Date
              <br />
              {{ now }}}
            </v-subheader>
          </v-col>
          <v-col cols="4" class="text-right">
            <DatetimePicker v-model="date3" required clearable use-seconds />
          </v-col>
          <v-col cols="5">
            <span>
              typeof =>
              {{ getType(date3) }}
              <br />
              {{ date3 }}
            </span>
          </v-col>
          <v-divider class="mr-1" />
        </v-row>
      </v-card-text>
      <v-card-title> DateStartEndPicker.vue </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4" class="text-right" offset="3">
            <DateStartEndPicker :start.sync="start1" :end.sync="end1" />
          </v-col>
          <v-col cols="5">
            {{ start1 }}
            <br />
            {{ end1 }}
          </v-col>
          <v-divider class="mr-1" />
        </v-row>
      </v-card-text>
      <v-card-title> DatetimeStartEndPicker.vue </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4" class="text-right" offset="3">
            <DatetimeStartEndPicker :start.sync="start2" :end.sync="end2" />
          </v-col>
          <v-col cols="5">
            {{ start2 }}
            <br />
            {{ end2 }}
          </v-col>
          <v-col cols="4" class="text-right" offset="3">
            <DatetimeStartEndPicker
              :start.sync="start3"
              :end.sync="end3"
              use-seconds
              required
              clearable
            />
          </v-col>
          <v-col cols="5">
            {{ start3 }}
            <br />
            {{ end3 }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import DatePicker from "@/components/picker/DatePicker.vue";
import dayjs from "dayjs";
import DatetimePicker from "@/components/picker/DatetimePicker.vue";
import DateStartEndPicker from "@/components/picker/DateStartEndPicker.vue";
import DatetimeStartEndPicker from "@/components/picker/DatetimeStartEndPicker.vue";
import { DateTime } from "@/definitions/types";
import { computed, ref } from "vue";

const date = ref(new Date() as DateTime);
const dateParseISOString = ref(dayjs().toISOString());
const dateParseNumber = ref(dayjs().toDate().getTime());
const date2 = ref(new Date() as DateTime);
const date3 = ref(new Date() as DateTime);
const start1 = ref(dayjs().add(-1, "day").toDate() as DateTime);
const end1 = ref(dayjs().add(1, "day").toDate() as DateTime);
const start2 = ref(dayjs().add(-1, "day").startOf("day").toDate() as DateTime);
const end2 = ref(dayjs().add(1, "day").endOf("day").toDate() as DateTime);
const start3 = ref(dayjs().add(-1, "day").startOf("day").toDate() as DateTime);
const end3 = ref(dayjs().add(1, "day").endOf("day").toDate() as DateTime);

const now = computed((): Date => new Date());

function getType(val: DateTime): string {
  return typeof val === "object"
    ? val instanceof Date
      ? "Date"
      : "object"
    : typeof val;
}
</script>
