<template>
  <nav class="fixed bottom-0 left-0 right-0 z-30 border-t border-[#ebedf0] bg-white lg:hidden">
    <div class="mx-auto grid w-full max-w-3xl grid-cols-3">
      <button
        v-for="t in tabs"
        :key="t.name"
        class="flex flex-col items-center gap-0.5 py-2 text-[11px] transition"
        :class="active === t.name ? 'text-brand' : 'text-[#8f959e]'"
        @click="go(t)"
      >
        <span class="relative">
          <Icon :name="t.icon" :size="20" />
          <span
            v-if="t.badge && count > 0"
            class="absolute -right-1.5 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-brand px-[3px] text-[10px] leading-none text-white"
          >
            {{ count > 99 ? '99' : count }}
          </span>
        </span>
        <span>{{ t.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { myTodoCounts } from '../api'

const route = useRoute()
const router = useRouter()
const count = ref(0)
let timer = null

const tabs = [
  { name: 'home', label: '工作台', icon: 'home' },
  { name: 'pending', label: '待辦', icon: 'inbox', badge: true, query: { mode: 'pending' } },
  { name: 'mine', label: '我的', icon: 'file', query: { mode: 'mine' } },
]

const active = computed(() => {
  if (route.name === 'home') return 'home'
  if (route.name === 'list') return route.query.mode === 'mine' ? 'mine' : 'pending'
  return ''
})

function go(t) {
  if (t.name === 'home') router.push({ name: 'home' })
  else router.push({ name: 'list', query: t.query })
}

async function load() {
  try {
    const c = await myTodoCounts()
    count.value = (c && c.total) || 0
  } catch (e) {
    /* ignore */
  }
}

onMounted(() => {
  load()
  timer = setInterval(load, 30000)
})
onUnmounted(() => clearInterval(timer))
watch(() => route.fullPath, load)
</script>
