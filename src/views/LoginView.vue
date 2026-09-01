<template>
  <div class="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-5">
    <div class="w-full max-w-sm">
      <div class="mb-6">
        <div class="mb-5 flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-[15px] font-medium text-white">
            科
          </span>
          <div>
            <div class="text-[16px] font-medium text-[#1f2329]">科威爾 OA</div>
            <div class="text-[12px] text-[#8f959e]">日常辦公系統</div>
          </div>
        </div>
        <h1 class="text-[20px] font-medium text-[#1f2329]">登入</h1>
        <p class="mt-1 text-[13px] text-[#8f959e]">請輸入帳號密碼以繼續</p>
      </div>

      <form class="oa-card p-6" @submit.prevent="submit">
        <div class="mb-4">
          <label class="oa-label" for="usr">帳號</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a5a9b0]">
              <Icon name="user" :size="16" />
            </span>
            <input
              id="usr"
              v-model="usr"
              class="oa-input pl-9"
              type="text"
              autocomplete="username"
              placeholder="請輸入帳號"
              autofocus
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="oa-label" for="pwd">密碼</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a5a9b0]">
              <Icon name="clip" :size="16" />
            </span>
            <input
              id="pwd"
              v-model="pwd"
              class="oa-input pl-9"
              type="password"
              autocomplete="current-password"
              placeholder="請輸入密碼"
            />
          </div>
        </div>

        <label class="mb-5 flex items-center gap-2 text-[13px] text-[#646a73]">
          <input v-model="remember" type="checkbox" class="h-3.5 w-3.5 rounded border-[#dfe1e5] text-brand" />
          記住帳號
        </label>

        <p
          v-if="error"
          class="mb-4 rounded-lg bg-[#fff1f0] px-3.5 py-2.5 text-[13px] text-[#a8071a] ring-1 ring-inset ring-[#ffa39e]"
        >
          {{ error }}
        </p>

        <button type="submit" class="oa-btn oa-btn-primary w-full py-2.5" :disabled="busy">
          {{ busy ? '登入中…' : '登入' }}
        </button>
      </form>

      <p class="mt-5 text-center text-[12px] leading-relaxed text-[#a5a9b0]">
        本系統僅供科威爾員工內部使用，所有操作均留有紀錄
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import { login } from '../api'
import { ensureSession } from '../session'

const route = useRoute()
const router = useRouter()

const usr = ref('')
const pwd = ref('')
const remember = ref(true)
const busy = ref(false)
const error = ref('')

onMounted(() => {
  const saved = localStorage.getItem('oa_usr')
  if (saved) usr.value = saved
})

async function submit() {
  if (!usr.value || !pwd.value) {
    error.value = '請輸入帳號與密碼'
    return
  }
  busy.value = true
  error.value = ''
  try {
    await login(usr.value.trim(), pwd.value)
    if (remember.value) localStorage.setItem('oa_usr', usr.value.trim())
    else localStorage.removeItem('oa_usr')
    await ensureSession(true)
    const next = route.query.next || route.query['redirect-to']
    router.replace(typeof next === 'string' && next ? next : { name: 'home' })
  } catch (e) {
    error.value = e.message || '登入失敗，請確認帳號密碼'
  } finally {
    busy.value = false
  }
}
</script>
