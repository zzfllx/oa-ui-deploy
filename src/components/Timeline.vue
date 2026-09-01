<template>
  <div class="relative pl-6">
    <div class="absolute bottom-3 left-[6px] top-3 w-px bg-[#ebedf0]"></div>

    <div v-for="(e, i) in events" :key="i" class="relative pb-4 last:pb-0">
      <span
        class="absolute -left-[21px] top-[5px] flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-white"
        :class="dotClass(e)"
      >
        <span v-if="i === events.length - 1" class="h-1.5 w-1.5 rounded-full bg-white"></span>
      </span>

      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-[13px] font-medium text-[#1f2329]">{{ title(e) }}</span>
          <span v-if="e.from" class="text-[12px] text-[#a5a9b0]">由「{{ e.from }}」</span>
        </div>
        <div
          v-if="e.content"
          class="mt-1.5 rounded-md bg-[#f7f8fa] px-2.5 py-1.5 text-[13px] leading-relaxed text-[#646a73]"
        >
          {{ e.content }}
        </div>
        <div class="mt-0.5 text-[12px] text-[#a5a9b0]">
          {{ e.actor_name || e.actor }} ・ {{ absTime(e.time) }}
        </div>
      </div>
    </div>

    <p v-if="!events.length" class="text-[13px] text-[#a5a9b0]">尚無記錄</p>
  </div>
</template>

<script setup>
import { absTime } from '../forms'

defineProps({ events: { type: Array, default: () => [] } })

function title(e) {
  if (e.type === 'create') return '建立表單'
  if (e.type === 'state') return '狀態變更為「' + e.to + '」'
  if (e.type === 'comment') return '審批意見'
  return e.label || '更新'
}

function dotClass(e) {
  if (e.type === 'state') {
    if (e.to === '已核准') return 'bg-[#17915f]'
    if (e.to === '已駁回') return 'bg-[#d03050]'
    return 'bg-[#d97a1a]'
  }
  return 'bg-[#c9cdd4]'
}
</script>
