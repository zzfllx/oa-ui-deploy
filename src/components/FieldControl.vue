<template>
  <div>
    <!-- 附件 -->
    <div v-if="field.type === 'attach'">
      <div
        v-if="fileName"
        class="flex items-center gap-2 rounded-lg border border-[#dfe1e5] bg-white px-3 py-2"
      >
        <Icon name="clip" :size="15" class="text-[#8f959e]" />
        <a
          v-if="fileUrl"
          :href="fileUrl"
          target="_blank"
          rel="noreferrer"
          class="flex-1 truncate text-[14px] text-brand hover:underline"
          >{{ fileName }}</a
        >
        <span v-else class="flex-1 truncate text-[14px] text-[#1f2329]">{{ fileName }}</span>
        <button
          type="button"
          class="shrink-0 rounded px-2 py-1 text-[12px] text-[#8f959e] hover:bg-[#f2f3f5]"
          @click="clearFile"
        >
          移除
        </button>
      </div>
      <label
        v-else
        class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#dfe1e5] bg-white px-3 py-2.5 text-[14px] text-[#646a73] transition hover:border-brand hover:text-brand"
      >
        <Icon name="plus" :size="15" /> 選擇檔案
        <input type="file" class="hidden" :disabled="disabled" @change="onFile" />
      </label>
      <p v-if="field.hint" class="mt-1 text-[12px] text-[#a5a9b0]">{{ field.hint }}</p>
    </div>

    <!-- 勾選 -->
    <button
      v-else-if="field.type === 'check'"
      type="button"
      class="flex w-full items-center justify-between rounded-lg border border-[#dfe1e5] bg-white px-3 py-2 text-[14px] transition"
      :class="value ? 'border-brand/40 bg-[#fdf3f3]' : ''"
      :disabled="disabled"
      @click="emit('update:modelValue', !value)"
    >
      <span class="text-[#1f2329]">{{ value ? '是' : '否' }}</span>
      <span
        class="relative h-5 w-9 rounded-full transition"
        :class="value ? 'bg-brand' : 'bg-[#d0d3d8]'"
      >
        <span
          class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
          :class="value ? 'left-[18px]' : 'left-0.5'"
        ></span>
      </span>
    </button>

    <!-- 下拉 -->
    <select
      v-else-if="field.type === 'select'"
      class="oa-input cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%238f959e%22 stroke-width=%222.5%22 viewBox=%220 0 24 24%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:15px] bg-[right_10px_center] bg-no-repeat pr-9"
      :value="value == null ? '' : value"
      :disabled="disabled"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option value="">請選擇</option>
      <option v-for="o in field.options" :key="o" :value="o">{{ o }}</option>
    </select>

    <!-- 多行 -->
    <textarea
      v-else-if="field.type === 'textarea'"
      class="oa-input"
      rows="3"
      :value="value || ''"
      :disabled="disabled"
      :placeholder="field.placeholder || ''"
      @input="emit('update:modelValue', $event.target.value)"
    ></textarea>

    <!-- 金額 -->
    <div v-else-if="field.type === 'currency'" class="relative">
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#a5a9b0]">
        NT$
      </span>
      <input
        class="oa-input pl-11"
        type="number"
        inputmode="decimal"
        step="1"
        :value="value == null ? '' : value"
        :disabled="disabled"
        :placeholder="field.readonly ? '自動計算' : '0'"
        @input="onNumber"
      />
    </div>

    <!-- 數字 -->
    <input
      v-else-if="field.type === 'number'"
      class="oa-input"
      type="number"
      step="1"
      :value="value == null ? '' : value"
      :disabled="disabled"
      :placeholder="field.readonly ? '自動計算' : ''"
      @input="onNumber"
    />

    <!-- 日期 -->
    <input
      v-else-if="field.type === 'date'"
      class="oa-input"
      type="date"
      :value="value || ''"
      :disabled="disabled"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <!-- 文字 -->
    <input
      v-else
      class="oa-input"
      type="text"
      :value="value || ''"
      :disabled="disabled"
      :placeholder="field.placeholder || ''"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { default: null },
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const value = computed(() => props.modelValue)

const fileName = computed(() => {
  const v = props.modelValue
  if (v instanceof File) return v.name
  if (typeof v === 'string' && v) return v.split('/').pop()
  return ''
})

const fileUrl = computed(() => {
  const v = props.modelValue
  return typeof v === 'string' && v ? v : ''
})

function onFile(e) {
  const f = e.target.files && e.target.files[0]
  if (f) emit('update:modelValue', f)
  e.target.value = ''
}

function clearFile() {
  emit('update:modelValue', '')
}

function onNumber(e) {
  const raw = e.target.value
  emit('update:modelValue', raw === '' ? null : Number(raw))
}
</script>
