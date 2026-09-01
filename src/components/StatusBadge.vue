<template>
  <span
    class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ring-1 ring-inset"
    :class="STATE_STYLE[state] || 'bg-slate-100 text-slate-600 ring-slate-200'"
  >
    {{ state || '—' }}
  </span>
</template>

<script setup>
import { STATE_STYLE } from '../forms'

defineProps({ state: String })
</script>
