<template>
  <LegacyForm v-if="legacy" :form-key="key" />
  <MetaForm
    v-else-if="setting"
    :doctype="setting.doctype"
    :route-key="setting.key"
    :icon="setting.icon"
    :color="setting.color"
    :employee-field="setting.employee_field"
  />
  <div v-else class="oa-card px-4 py-10 text-center text-[13px] text-[#a5a9b0]">
    找不到對應的表單
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LegacyForm from '../components/LegacyForm.vue'
import MetaForm from '../components/MetaForm.vue'
import { resolve } from '../registry'

const route = useRoute()
const key = route.params.key
const setting = computed(() => resolve(key))
const legacy = computed(() => (setting.value ? setting.value.legacy : null))
</script>
