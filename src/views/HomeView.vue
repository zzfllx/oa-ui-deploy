<template>
  <div>
    <!-- 個人資訊與統計 -->
    <div class="oa-card mb-4 p-4">
      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <div class="text-[13px] text-[#8f959e]">你好，</div>
          <div class="mt-0.5 truncate text-[17px] font-medium text-[#1f2329]">{{ greetingName }}</div>
          <div class="mt-0.5 truncate text-[13px] text-[#8f959e]">
            {{ [emp.department, emp.designation].filter(Boolean).join(' ・ ') || '未設定部門' }}
          </div>
        </div>
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f3f5] text-[#646a73]">
          <Icon name="user" :size="18" />
        </span>
      </div>

      <div class="mt-4 grid grid-cols-3 border-t border-[#ebedf0] pt-3">
        <button
          class="border-r border-[#ebedf0] px-2 text-center transition hover:bg-[#f7f8fa]"
          @click="$router.push({ name: 'list', query: { mode: 'pending' } })"
        >
          <div class="text-[20px] font-medium leading-tight" :class="stats.pending ? 'text-brand' : 'text-[#1f2329]'">
            {{ stats.pending }}
          </div>
          <div class="mt-0.5 text-[12px] text-[#8f959e]">待我核准</div>
        </button>
        <button
          class="border-r border-[#ebedf0] px-2 text-center transition hover:bg-[#f7f8fa]"
          @click="$router.push({ name: 'list', query: { mode: 'mine' } })"
        >
          <div class="text-[20px] font-medium leading-tight text-[#1f2329]">{{ stats.mine }}</div>
          <div class="mt-0.5 text-[12px] text-[#8f959e]">我發起</div>
        </button>
        <button class="px-2 text-center transition hover:bg-[#f7f8fa]">
          <div class="text-[20px] font-medium leading-tight text-[#1f2329]">{{ stats.done }}</div>
          <div class="mt-0.5 text-[12px] text-[#8f959e]">已結案</div>
        </button>
      </div>
    </div>

    <!-- 發起申請 -->
    <div class="oa-card mb-4 p-4">
      <div class="oa-title mb-3"><span class="oa-bar"></span>發起申請</div>
      <div class="grid grid-cols-4 gap-1">
        <button
          v-for="f in homeForms"
          :key="f.key"
          class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5 transition hover:bg-[#f7f8fa]"
          @click="$router.push({ name: 'new', params: { key: f.key } })"
        >
          <span class="flex h-10 w-10 items-center justify-center rounded-lg" :style="{ background: f.color + '1a' }">
            <Icon :name="f.icon" :size="19" :color="f.color" />
          </span>
          <span class="whitespace-nowrap text-[12px] text-[#646a73]">{{ f.label }}</span>
        </button>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="oa-card divide-y divide-[#f0f1f3]">
      <div v-for="i in 3" :key="i" class="h-[60px] animate-pulse bg-[#fafbfc]"></div>
    </div>

    <template v-else>
      <!-- 待我核准 -->
      <section class="mb-4">
        <div class="mb-2 flex items-center justify-between">
          <div class="oa-title">
            <span class="oa-bar"></span>待我核准
            <span v-if="pending.length" class="text-[13px] font-normal text-[#8f959e]">({{ pending.length }})</span>
          </div>
          <button
            v-if="pending.length > 3"
            class="flex items-center text-[13px] text-[#8f959e] hover:text-brand"
            @click="$router.push({ name: 'list', query: { mode: 'pending' } })"
          >
            全部 <Icon name="chevron" :size="14" />
          </button>
        </div>
        <div class="oa-card divide-y divide-[#f0f1f3]">
          <p v-if="!pending.length" class="px-4 py-8 text-center text-[13px] text-[#a5a9b0]">
            目前沒有待你核准的單據
          </p>
          <DocCard v-for="d in pending.slice(0, 3)" :key="d.name" :form="formOf(d)" :doc="d" />
        </div>
      </section>

      <!-- 我的申請 -->
      <section>
        <div class="mb-2 flex items-center justify-between">
          <div class="oa-title">
            <span class="oa-bar"></span>我的申請
            <span v-if="mine.length" class="text-[13px] font-normal text-[#8f959e]">({{ mine.length }})</span>
          </div>
          <button
            v-if="mine.length > 5"
            class="flex items-center text-[13px] text-[#8f959e] hover:text-brand"
            @click="$router.push({ name: 'list', query: { mode: 'mine' } })"
          >
            全部 <Icon name="chevron" :size="14" />
          </button>
        </div>
        <div class="oa-card divide-y divide-[#f0f1f3]">
          <p v-if="!mine.length" class="px-4 py-8 text-center text-[13px] text-[#a5a9b0]">
            還沒有申請紀錄，從上方「發起申請」開始
          </p>
          <DocCard
            v-for="d in mine.slice(0, 5)"
            :key="d.name"
            :form="formOf(d)"
            :doc="d"
            :show-owner="false"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import DocCard from '../components/DocCard.vue'
import { listHome } from '../registry'
import { formOf, loadMine, loadPending } from '../data'
import { docStats } from '../api'
import { session } from '../session'

const loading = ref(true)
const pending = ref([])
const mine = ref([])
const stats = reactive({ pending: 0, mine: 0, done: 0 })

const emp = computed(() => session.employee || {})

const homeForms = computed(() => listHome())

const greetingName = computed(() => {
  if (emp.value.employee_name) return emp.value.employee_name
  return session.user || ''
})

async function load() {
  loading.value = true
  try {
    const [p, m, s] = await Promise.all([
      loadPending().catch(() => []),
      loadMine().catch(() => []),
      docStats().catch(() => ({ pending: 0, mine: 0, done: 0 })),
    ])
    pending.value = p
    mine.value = m
    stats.pending = s.pending != null ? s.pending : p.length
    stats.mine = s.mine || 0
    stats.done = s.done || 0
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
