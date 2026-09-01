<template>
  <div
    class="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-[#f7f8fa] active:bg-[#f2f3f5]"
    @click="open"
  >
    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" :style="{ background: color + '1a' }">
      <Icon :name="icon" :size="16" :color="color" />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="truncate text-[14px] font-medium text-[#1f2329]">{{ title }}</span>
        <StatusBadge :state="doc.workflow_state" />
      </div>
      <div class="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-[#8f959e]">
        <span v-if="showOwner" class="shrink-0">{{ owner }}</span>
        <span v-if="showOwner" class="text-[#d0d3d8]">·</span>
        <span class="truncate">{{ subtitle }}</span>
      </div>
    </div>

    <span class="shrink-0 text-[12px] text-[#a5a9b0]">{{ timeText }}</span>
    <Icon name="chevron" :size="15" class="text-[#c9cdd4]" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import StatusBadge from './StatusBadge.vue'
import { FORMS, summarize, relTime } from '../forms'
import { byKey } from '../registry'

const props = defineProps({
  doc: { type: Object, required: true },
  showOwner: { type: Boolean, default: true },
})

const router = useRouter()
const key = computed(() => props.doc._form_key || props.doc._doctype)
const setting = computed(() => byKey(key.value))
const legacy = computed(() => FORMS[key.value] || null)

const icon = computed(() => (setting.value ? setting.value.icon : 'file'))
const color = computed(() => (setting.value ? setting.value.color : '#646a73'))
const label = computed(() => (setting.value ? setting.value.label : props.doc._doctype || '表單'))

const info = computed(() => (legacy.value ? summarize(legacy.value, props.doc) : null))
const title = computed(() => (info.value ? info.value.title : props.doc.name || label.value))
const subtitle = computed(() => (info.value ? info.value.subtitle || label.value : label.value))
const owner = computed(() => props.doc.employee_name || props.doc.owner || '')
const timeText = computed(() => relTime(props.doc.modified || props.doc.creation))

function open() {
  const k = setting.value ? setting.value.key : key.value
  router.push({ name: 'doc', params: { key: k, name: props.doc.name } })
}
</script>
