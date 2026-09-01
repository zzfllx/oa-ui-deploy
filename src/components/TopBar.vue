<template>
  <header class="sticky top-0 z-30 border-b border-[#ebedf0] bg-white">
    <div class="mx-auto flex h-12 w-full max-w-3xl items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <span class="flex h-6 w-6 items-center justify-center rounded bg-brand text-[12px] font-medium text-white">
          科
        </span>
        <span class="text-[15px] font-medium text-[#1f2329]">科威爾 OA</span>
      </div>

      <div class="flex items-center gap-0.5">
        <button
          class="relative rounded-md p-2 text-[#646a73] transition hover:bg-[#f2f3f5]"
          title="待辦"
          @click="$router.push({ name: 'list', query: { mode: 'pending' } })"
        >
          <Icon name="bell" :size="17" />
          <span
            v-if="count > 0"
            class="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-brand px-[3px] text-[10px] leading-none text-white"
          >
            {{ count > 99 ? '99' : count }}
          </span>
        </button>
        <a
          href="/desk"
          class="rounded-md p-2 text-[#646a73] transition hover:bg-[#f2f3f5]"
          title="管理後台"
        >
          <Icon name="settings" :size="17" />
        </a>
        <button
          class="rounded-md p-2 text-[#646a73] transition hover:bg-[#f2f3f5]"
          title="登出"
          @click="onLogout"
        >
          <Icon name="logout" :size="17" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { session, resetSession } from '../session'
import { logout, myTodoCounts } from '../api'

const router = useRouter()
const count = ref(0)
let timer = null

async function load() {
  try {
    const c = await myTodoCounts()
    count.value = (c && c.total) || 0
  } catch (e) {
    /* ignore */
  }
}

async function onLogout() {
  if (!window.confirm('確定要登出嗎？')) return
  await logout()
  resetSession()
  router.push({ name: 'login' })
}

onMounted(() => {
  load()
  timer = setInterval(load, 30000)
})
onUnmounted(() => clearInterval(timer))
watch(() => session.user, load)
</script>
