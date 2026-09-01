<template>
  <div class="flex h-full flex-col">
    <!-- 品牌 -->
    <div class="flex h-14 items-center gap-2.5 border-b border-[#ebedf0] px-4">
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[15px] font-semibold text-white">科</span>
      <span class="text-[15px] font-semibold text-[#1f2329]">科威爾 OA</span>
    </div>

    <!-- 導航 -->
    <nav class="flex-1 overflow-y-auto px-3 py-3">
      <button class="nav-item" :class="isActive('home') ? 'nav-active' : ''" @click="go({ name: 'home' })">
        <Icon name="home" :size="17" />
        <span class="flex-1 text-left">工作台</span>
      </button>

      <!-- 發起申請（分組） -->
      <div class="mt-1">
        <button class="nav-item w-full" @click="launchOpen = !launchOpen">
          <Icon name="edit" :size="17" />
          <span class="flex-1 text-left font-medium">發起申請</span>
          <Icon name="chevron" :size="14" class="text-[#a5a9b0] transition" :class="launchOpen ? 'rotate-90' : ''" />
        </button>
        <div v-show="launchOpen" class="mt-0.5 space-y-0.5 pl-3">
          <button
            v-for="f in homeForms"
            :key="f.key"
            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13.5px] transition"
            :class="isActiveForm(f.key) ? 'bg-brand/10 text-brand' : 'text-[#646a73] hover:bg-[#f7f8fa]'"
            @click="go({ name: 'new', params: { key: f.key } })"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded-md" :style="{ background: f.color + '1a' }">
              <Icon :name="f.icon" :size="14" :color="f.color" />
            </span>
            <span class="truncate">{{ f.label }}</span>
          </button>
          <p v-if="!homeForms.length" class="px-3 py-1.5 text-[12px] text-[#a5a9b0]">尚無表單</p>
        </div>
      </div>

      <button class="nav-item" :class="isActive('list', 'pending') ? 'nav-active' : ''" @click="go({ name: 'list', query: { mode: 'pending' } })">
        <Icon name="inbox" :size="17" />
        <span class="flex-1 text-left">待我核准</span>
        <span v-if="todoCount > 0" class="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-[5px] text-[11px] leading-none text-white">
          {{ todoCount > 99 ? '99' : todoCount }}
        </span>
      </button>

      <button class="nav-item" :class="isActive('list', 'mine') ? 'nav-active' : ''" @click="go({ name: 'list', query: { mode: 'mine' } })">
        <Icon name="file" :size="17" />
        <span class="flex-1 text-left">我的申請</span>
      </button>
    </nav>

    <!-- 用戶 -->
    <div class="border-t border-[#ebedf0] p-3">
      <div class="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f3f5] text-[#646a73]">
          <Icon name="user" :size="16" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="truncate text-[13px] font-medium text-[#1f2329]">{{ empName }}</div>
          <div class="truncate text-[12px] text-[#8f959e]">{{ empDept }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { session } from '../session'
import { formsRef } from '../registry'
import { myTodoCounts } from '../api'

const route = useRoute()
const router = useRouter()
const launchOpen = ref(true)
const todoCount = ref(0)
let timer = null

const homeForms = computed(() => (formsRef.value || []).filter((s) => s.in_home))
const emp = computed(() => session.employee || {})
const empName = computed(() => emp.value.employee_name || session.user || '')
const empDept = computed(() => [emp.value.department, emp.value.designation].filter(Boolean).join(' ・ ') || '')

function isActive(name, mode) {
  if (route.name !== name) return false
  if (name === 'list') return (route.query.mode === 'mine' ? 'mine' : 'pending') === mode
  return true
}
function isActiveForm(key) {
  return route.name === 'new' && route.params.key === key
}
function go(to) {
  router.push(to)
}

async function loadCount() {
  try {
    const c = await myTodoCounts()
    todoCount.value = (c && c.total) || 0
  } catch (e) {
    /* ignore */
  }
}

onMounted(() => {
  loadCount()
  timer = setInterval(loadCount, 30000)
})
onUnmounted(() => clearInterval(timer))
</script>
