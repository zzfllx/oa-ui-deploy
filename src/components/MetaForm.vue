<template>
  <div v-if="loading" class="oa-card divide-y divide-[#f0f1f3]">
    <div v-for="i in 3" :key="i" class="h-20 animate-pulse bg-[#fafbfc]"></div>
  </div>

  <div v-else-if="error && !meta" class="oa-card px-4 py-8 text-center text-[13px] text-[#a8071a]">
    {{ error }}
  </div>

  <div v-else-if="meta">
    <!-- 申請人 -->
    <div class="oa-card mb-4 flex items-center gap-3 p-4">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="iconBg">
        <Icon :name="icon" :size="18" :color="color" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="text-[14px] font-medium text-[#1f2329]">{{ emp.employee_name || '—' }}</div>
        <div class="text-[13px] text-[#8f959e]">
          {{ [emp.department, emp.designation].filter(Boolean).join(' ・ ') || '未設定部門' }}
        </div>
      </div>
      <span class="shrink-0 text-[12px] text-[#a5a9b0]">{{ today }}</span>
    </div>

    <p v-if="!emp.name" class="mb-4 rounded-lg bg-[#fff7e6] px-3.5 py-2.5 text-[13px] text-[#a35b00] ring-1 ring-inset ring-[#ffd591]">
      你的帳號尚未綁定員工資料，請先聯絡管理員設定後再提出申請。
    </p>

    <!-- 主表欄位（按 Section Break 分區：泛微式分區標題條） -->
    <div v-for="(sec, si) in sections" :key="'s' + si" class="mb-4">
      <div class="oa-card overflow-hidden">
        <div v-if="sec.title" class="oa-sec-head"><span class="oa-bar"></span>{{ sec.title }}</div>
        <div class="p-4">
          <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
            <div v-for="f in sec.fields" :key="f.name" :class="f.type === 'textarea' ? 'md:col-span-2' : ''">
              <label class="oa-label">{{ f.label }}<span v-if="f.required" class="ml-0.5 text-brand">*</span></label>
              <FieldControl :field="f" v-model="values[f.name]" :disabled="f.readonly" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 子表（可編輯網格） -->
    <div v-for="(tb, ti) in tables" :key="'t' + ti" class="mb-4">
      <div class="oa-title mb-2"><span class="oa-bar"></span>{{ tb.label }}</div>
      <div class="oa-card p-4">
        <div class="space-y-3">
          <div v-for="(row, ri) in rows[tb.name]" :key="ri" class="rounded-lg border border-[#ebedf0] bg-[#fafbfc] p-3">
            <div class="mb-2.5 flex items-center justify-between">
              <span class="text-[12px] text-[#8f959e]">第 {{ ri + 1 }} 筆</span>
              <button type="button" class="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[12px] text-[#8f959e] transition hover:bg-[#fff1f0] hover:text-[#d03050]" @click="removeRow(tb.name, ri)">
                <Icon name="close" :size="12" /> 移除
              </button>
            </div>
            <div class="flex flex-wrap items-start gap-3">
              <div v-for="c in tb.columns" :key="c.name" :class="c.width || 'flex-1 min-w-[7rem]'">
                <label class="oa-label">{{ c.label }}<span v-if="c.required" class="ml-0.5 text-brand">*</span></label>
                <FieldControl :field="c" v-model="row[c.name]" />
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#dfe1e5] py-2.5 text-[14px] text-[#646a73] transition hover:border-brand hover:text-brand" @click="addRow(tb)">
          <Icon name="plus" :size="15" /> {{ tb.addLabel }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mb-4 rounded-lg bg-[#fff1f0] px-3.5 py-2.5 text-[13px] text-[#a8071a] ring-1 ring-inset ring-[#ffa39e]">{{ error }}</p>

    <div class="fixed bottom-0 left-0 right-0 border-t border-[#ebedf0] bg-white p-4 md:static md:border-0 md:p-0">
      <div class="mx-auto flex w-full max-w-5xl gap-3">
        <button class="oa-btn oa-btn-ghost flex-1" :disabled="busy" @click="save(false)">儲存草稿</button>
        <button class="oa-btn oa-btn-primary flex-[2]" :disabled="busy || !emp.name" @click="save(true)">
          {{ busy ? '處理中…' : '送出申請' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import FieldControl from './FieldControl.vue'
import { getMeta, linkOptions, createDoc, applyWorkflow, uploadFile, updateDoc, getDoc, getTransitions } from '../api'
import { metaToSections, childColumns } from '../meta'
import { session } from '../session'

const props = defineProps({
  doctype: { type: String, required: true },
  routeKey: { type: String, default: '' },
  icon: { type: String, default: 'file' },
  color: { type: String, default: '#1e6fd9' },
  employeeField: { type: String, default: 'employee' },
})

const router = useRouter()
const today = new Date().toISOString().slice(0, 10)
const emp = computed(() => session.employee || {})
const iconBg = computed(() => 'bg-[#eef3fb]')

const loading = ref(true)
const meta = ref(null)
const sections = ref([])
const tables = ref([])
const values = reactive({})
const rows = reactive({})
const busy = ref(false)
const error = ref('')

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const m = await getMeta(props.doctype)
    if (!m) {
      error.value = '無法讀取表單定義'
      return
    }
    meta.value = m
    const built = metaToSections(m)
    sections.value = built.sections
    // Link 欄位轉為下拉（抓取關聯 DocType 的資料）
    await Promise.all(
      sections.value.flatMap((s) =>
        s.fields
          .filter((f) => f.type === 'link' && f.linkDoctype)
          .map(async (f) => {
            try {
              const opts = await linkOptions(f.linkDoctype)
              f.type = 'select'
              f.options = opts || []
            } catch (e) {
              f.type = 'text'
            }
          })
      )
    )
    // 子表：抓取子 DocType meta
    tables.value = []
    for (const tb of built.tables) {
      try {
        const cm = await getMeta(tb.doctype)
        tb.columns = childColumns(cm)
        tables.value.push(tb)
        rows[tb.name] = [emptyRow(tb.columns)]
      } catch (e) {
        /* 子表讀取失敗不阻斷 */
      }
    }
    // 預設值 + 日期預設今天
    sections.value.forEach((s) =>
      s.fields.forEach((f) => {
        if (f.default) values[f.name] = f.default
        else if (f.type === 'date') values[f.name] = today
      })
    )
  } catch (e) {
    error.value = e.message || '載入失敗'
  } finally {
    loading.value = false
  }
}

function emptyRow(columns) {
  const r = {}
  ;(columns || []).forEach((c) => {
    r[c.name] = c.type === 'date' ? today : null
  })
  return r
}

function addRow(tb) {
  if (!rows[tb.name]) rows[tb.name] = []
  rows[tb.name].push(emptyRow(tb.columns))
}

function removeRow(name, i) {
  rows[name].splice(i, 1)
  if (!rows[name].length) rows[name].push(emptyRow(tables.value.find((t) => t.name === name)?.columns))
}

function allFields() {
  const fs = []
  sections.value.forEach((s) => fs.push(...s.fields))
  return fs
}

function validate() {
  const miss = []
  allFields().forEach((f) => {
    if (f.required && (values[f.name] === '' || values[f.name] == null)) miss.push(f.label)
  })
  tables.value.forEach((tb) => {
    const rs = rows[tb.name] || []
    if (!rs.length) miss.push(tb.label)
    rs.forEach((r, i) => {
      tb.columns.forEach((c) => {
        if (c.required && (r[c.name] === '' || r[c.name] == null)) miss.push('第 ' + (i + 1) + ' 筆的' + c.label)
      })
    })
  })
  return miss
}

function collectPayload() {
  const payload = {}
  allFields().forEach((f) => {
    const v = values[f.name]
    if (v instanceof File) return
    if (v === null || v === undefined || v === '') return
    payload[f.name] = v
  })
  payload[props.employeeField] = emp.value.name
  tables.value.forEach((tb) => {
    payload[tb.name] = (rows[tb.name] || []).map((r) => {
      const o = {}
      tb.columns.forEach((c) => {
        const v = r[c.name]
        o[c.name] = v === '' || v === undefined ? null : v
      })
      return o
    })
  })
  return payload
}

async function save(submit) {
  error.value = ''
  if (submit) {
    const miss = validate()
    if (miss.length) {
      error.value = '請填寫：' + miss.slice(0, 4).join('、') + (miss.length > 4 ? ' 等' : '')
      return
    }
  }
  busy.value = true
  try {
    const payload = collectPayload()
    const created = await createDoc(props.doctype, payload)
    // 附件上傳
    const attaches = []
    allFields().forEach((f) => {
      if (f.type === 'attach' && values[f.name] instanceof File) attaches.push({ field: f.name, file: values[f.name] })
    })
    for (const a of attaches) {
      try {
        const up = await uploadFile(a.file, props.doctype, created.name, a.field)
        const url = up && up.file_url ? up.file_url : ''
        if (url) await updateDoc(props.doctype, created.name, { [a.field]: url })
      } catch (e) {
        /* 附件失敗不阻斷 */
      }
    }
    if (submit) {
      const doc = await getDoc(props.doctype, created.name)
      const trs = await getTransitions(doc).catch(() => [])
      const set = []
      ;(trs || []).forEach((t) => {
        const a = t.action || t
        if (set.indexOf(a) < 0) set.push(a)
      })
      const action = set.find((a) => a !== '駁回') || set[0]
      if (action) await applyWorkflow(props.doctype, doc, action)
    }
    router.replace({ name: 'doc', params: { key: props.routeKey || props.doctype, name: created.name } })
  } catch (e) {
    error.value = e.message || '送出失敗'
  } finally {
    busy.value = false
  }
}
</script>
