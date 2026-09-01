<template>
  <div class="min-h-screen bg-[#f5f6f8]">
    <!-- 桌面左導航 -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-[232px] border-r border-[#ebedf0] bg-white lg:flex">
      <SideNav />
    </aside>

    <!-- 頂欄 -->
    <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#ebedf0] bg-white lg:pl-[232px]">
      <button class="ml-3 rounded-md p-2 text-[#646a73] hover:bg-[#f2f3f5] lg:hidden" title="選單" @click="drawer = true">
        <Icon name="grid" :size="18" />
      </button>
      <div class="relative hidden max-w-md flex-1 md:block">
        <Icon name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a5a9b0]" />
        <input
          v-model="keyword"
          class="oa-input !py-1.5 !text-[13px] pl-9"
          placeholder="搜尋單據 / 人員"
          @keyup.enter="onSearch"
        />
      </div>
      <div class="flex-1 md:hidden"></div>
      <div class="flex items-center gap-1 pr-3">
        <button
          class="relative rounded-md p-2 text-[#646a73] hover:bg-[#f2f3f5]"
          title="待辦"
          @click="$router.push({ name: 'list', query: { mode: 'pending' } })"
        >
          <Icon name="bell" :size="18" />
        </button>
        <a href="/desk" class="rounded-md p-2 text-[#646a73] hover:bg-[#f2f3f5]" title="管理後台">
          <Icon name="settings" :size="18" />
        </a>
        <button class="rounded-md p-2 text-[#646a73] hover:bg-[#f2f3f5]" title="登出" @click="onLogout">
          <Icon name="logout" :size="18" />
        </button>
      </div>
    </header>

    <!-- 內容 -->
    <main class="lg:pl-[232px]">
      <div class="mx-auto max-w-5xl px-4 pb-20 pt-5 lg:pb-5">
        <slot />
      </div>
    </main>

    <!-- 行動版底部導航 -->
    <BottomNav />

    <!-- 行動版抽屜 -->
    <div v-if="drawer" class="fixed inset-0 z-50 lg:hidden" @click="drawer = false">
      <div class="absolute inset-0 bg-black/30"></div>
      <aside class="absolute inset-y-0 left-0 w-[232px] bg-white shadow-pop" @click.stop>
        <SideNav />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'
import SideNav from './SideNav.vue'
import BottomNav from './BottomNav.vue'
import { session, resetSession } from '../session'
import { logout } from '../api'

const route = useRoute()
const router = useRouter()
const drawer = ref(false)
const keyword = ref('')

watch(
  () => route.fullPath,
  () => {
    drawer.value = false
  }
)

function onSearch() {
  if (keyword.value.trim()) router.push({ name: 'list', query: { mode: 'mine' } })
  keyword.value = ''
}

async function onLogout() {
  if (!window.confirm('確定要登出嗎？')) return
  await logout()
  resetSession()
  router.push({ name: 'login' })
}
</script>
