import { ref } from 'vue'
import { formSettings } from './api'
import { FORMS } from './forms'

// 表单注册表：唯一真相源来自后端 form_settings()
// （OA Form Setting 优先，兜底扫 Workflow）。前端不再硬编码任何单据清单。
const settings = ref([])
const loaded = ref(false)

// 供組件做響應式取用（settings 是 ref，直接導出以保留響應性）
export const formsRef = settings

export async function loadRegistry(force) {
  if (loaded.value && !force) return settings.value
  const list = await formSettings().catch(() => [])
  settings.value = Array.isArray(list) ? list : []
  loaded.value = true
  return settings.value
}

export function registry() {
  return settings.value
}

export function byKey(key) {
  return settings.value.find((s) => s.key === key) || null
}

export function byDoctype(dt) {
  return settings.value.find((s) => s.doctype === dt) || null
}

export function listHome() {
  return settings.value.filter((s) => s.in_home)
}

export function allSettings() {
  return settings.value
}

// 路由 key 解析：返回后端設定 + 旧 forms.js 的布局兜底（legacy）
// 新表單在 forms.js 中沒有對應項 → legacy 為 null → 走通用 meta 渲染
export function resolve(key) {
  const s = byKey(key)
  if (!s) return null
  return Object.assign({}, s, { legacy: FORMS[s.key] || null })
}
