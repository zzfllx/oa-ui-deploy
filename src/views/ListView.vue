<template>
  <div>
    <h1 class="mb-3 text-[17px] font-medium text-[#1f2329]">{{ title }}</h1>

    <div class="mb-3 inline-flex rounded-lg border border-[#ebedf0] bg-white p-0.5">
      <button
        v-for="t in tabs"
        :key="t.mode"
        class="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] transition"
        :class="mode === t.mode ? 'bg-brand text-white' : 'text-[#646a73] hover:bg-[#f7f8fa]'"
        @click="$router.replace({ name: 'list', query: { mode: t.mode } })"
      >
        <Icon :name="t.icon" :size="14" />
        {{ t.label }}
        <span v-if="t.mode === 'pending' && count">({{ count }})</span>
      </button>
    </div>

    <div v-if="loading" class="oa-card divide-y divide-[#f0f1f3]">
      <div v-for="i in 4" :key="i" class="h-[60px] animate-pulse bg-[#fafbfc]"></div>
    </div>

    <div v-else-if="!docs.length" class="oa-card px-4 py-12 text-center text-[13px] text-[#a5a9b0]">
      {{ emptyText }}
    </div>

    <div v-else class="oa-card divide-y divide-[#f0f1f3]">
      <DocCard
        v-for="d in docs"
        :key="d._doctype + d.name"
        :doc="d"
        :show-owner="mode === 'pending'"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import DocCard from '../components/DocCard.vue'
import { loadMine, loadPending } from '../data'

const route = useRoute()
const loading = ref(true)
const docs = ref([])
const count = ref(0)

const tabs = [
  { mode: 'pending', label: '待我核准', icon: 'inbox' },
  { mode: 'mine', label: '我的申請', icon: 'file' },
]

const mode = computed(() => (route.query.mode === 'mine' ? 'mine' : 'pending'))
const title = computed(() => (mode.value === 'mine' ? '我的申請' : '待我核准'))
const emptyText = computed(() =>
  mode.value === 'mine' ? '還沒有申請紀錄' : '目前沒有待你核准的單據'
)

async function load() {
  loading.value = true
  try {
    docs.value = mode.value === 'mine' ? await loadMine() : await loadPending()
    count.value = docs.value.length
  } catch (e) {
    docs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(mode, load)
</script>
