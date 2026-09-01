<template>
  <div v-if="form">
    <div class="mb-4 flex items-center gap-2">
      <button class="-ml-1 rounded-md p-1 text-[#646a73] hover:bg-[#f2f3f5]" @click="$router.back()">
        <Icon name="back" :size="20" />
      </button>
      <h1 class="text-[17px] font-medium text-[#1f2329]">{{ form.label }}</h1>
    </div>

    <div class="oa-card mb-4 flex items-center gap-3 p-4">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="form.iconBg">
        <Icon :name="form.icon" :size="18" :color="form.iconColor" />
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

    <div v-for="(sec, si) in form.sections" :key="'s' + si" class="mb-4">
      <div v-if="sec.title" class="oa-title mb-2"><span class="oa-bar"></span>{{ sec.title }}</div>
      <div class="oa-card p-4">
        <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
          <div v-for="f in sec.fields" :key="f.name" :class="f.half ? '' : 'md:col-span-2'">
            <label class="oa-label">
              {{ f.label }}<span v-if="f.required" class="ml-0.5 text-brand">*</span>
            </label>
            <FieldControl :field="f" v-model="values[f.name]" :disabled="f.readonly" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="form.children" class="mb-4">
      <div class="oa-title mb-2">
        <span class="oa-bar"></span>{{ form.children.label }}
        <span v-if="form.amountField" class="ml-auto text-[14px] font-medium text-brand">
          {{ money(values[form.amountField]) }}
        </span>
      </div>
      <div class="oa-card p-4">
        <div class="space-y-3">
          <div v-for="(row, i) in rows" :key="i" class="rounded-lg border border-[#ebedf0] bg-[#fafbfc] p-3">
            <div class="mb-2.5 flex items-center justify-between">
              <span class="text-[12px] text-[#8f959e]">第 {{ i + 1 }} 筆</span>
              <button type="button" class="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[12px] text-[#8f959e] transition hover:bg-[#fff1f0] hover:text-[#d03050]" @click="removeRow(i)">
                <Icon name="close" :size="12" /> 移除
              </button>
            </div>
            <div class="flex flex-wrap items-start gap-3">
              <div v-for="c in form.children.columns" :key="c.name" :class="c.width || 'flex-1 min-w-[7rem]'">
                <label class="oa-label">
                  {{ c.label }}<span v-if="c.required" class="ml-0.5 text-brand">*</span>
                </label>
                <FieldControl :field="c" v-model="row[c.name]" :disabled="c.readonly" />
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#dfe1e5] py-2.5 text-[14px] text-[#646a73] transition hover:border-brand hover:text-brand" @click="addRow">
          <Icon name="plus" :size="15" /> {{ form.children.addLabel }}
        </button>
      </div>
    </div>

    <div v-for="(sec, si) in form.sectionsAfter || []" :key="'a' + si" class="mb-4">
      <div v-if="sec.title" class="oa-title mb-2"><span class="oa-bar"></span>{{ sec.title }}</div>
      <div class="oa-card p-4">
        <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
          <div v-for="f in sec.fields" :key="f.name" :class="f.half ? '' : 'md:col-span-2'">
            <label class="oa-label">
              {{ f.label }}<span v-if="f.required" class="ml-0.5 text-brand">*</span>
            </label>
            <FieldControl :field="f" v-model="values[f.name]" :disabled="f.readonly" />
          </div>
        </div>
      </div>
    </div>

    <p v-if="error" class="mb-4 rounded-lg bg-[#fff1f0] px-3.5 py-2.5 text-[13px] text-[#a8071a] ring-1 ring-inset ring-[#ffa39e]">{{ error }}</p>

    <div class="fixed bottom-0 left-0 right-0 border-t border-[#ebedf0] bg-white p-4 md:static md:border-0 md:p-0">
      <div class="mx-auto flex w-full max-w-3xl gap-3">
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
import { FORMS, daysBetween, money } from '../forms'
import { createDoc, applyWorkflow, uploadFile, updateDoc, getDoc } from '../api'
import { session } from '../session'

const props = defineProps({ formKey: { type: String, required: true } })
const router = useRouter()
const form = FORMS[props.formKey] || null
const values = reactive({})
const rows = ref([])
const busy = ref(false)
const error = ref('')
const today = new Date().toISOString().slice(0, 10)
const emp = computed(() => session.employee || {})

function emptyRow() {
  const r = {}
  form.children.columns.forEach((c) => {
    r[c.name] = c.type === 'date' ? today : null
  })
  return r
}

function addRow() {
  rows.value.push(emptyRow())
}

function removeRow(i) {
  rows.value.splice(i, 1)
  recalc()
}

function recalc() {
  if (form.daysRange && form.daysField) {
    values[form.daysField] = daysBetween(values[form.daysRange[0]], values[form.daysRange[1]])
  }
  if (form.children) {
    if (form.children.rowAmount) {
      rows.value.forEach((r) => {
        r.amount = Number((Number(r.qty || 0) * Number(r.unit_price || 0)).toFixed(2))
      })
    }
    if (form.children.sumField) {
      const key = form.children.rowAmount ? 'amount' : form.children.sumField
      const sum = rows.value.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)
      values[form.children.sumField] = Number(sum.toFixed(2))
    }
  }
}

watch(values, recalc, { deep: true })
watch(rows, recalc, { deep: true })

onMounted(() => {
  if (!form) return
  ;(form.sections || []).forEach((s) =>
    s.fields.forEach((f) => {
      if (f.type === 'date' && f.name.indexOf('date') >= 0) values[f.name] = today
    })
  )
  if (form.children) addRow()
  recalc()
})

function validate() {
  const miss = []
  ;(form.sections || []).concat(form.sectionsAfter || []).forEach((s) =>
    s.fields.forEach((f) => {
      if (f.required && (values[f.name] === '' || values[f.name] === null || values[f.name] === undefined))
        miss.push(f.label)
    })
  )
  if (form.children) {
    if (!rows.value.length) miss.push(form.children.label)
    rows.value.forEach((r, i) => {
      form.children.columns.forEach((c) => {
        if (c.required && (r[c.name] === '' || r[c.name] === null || r[c.name] === undefined))
          miss.push('第 ' + (i + 1) + ' 筆的' + c.label)
      })
    })
  }
  return miss
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
    const payload = {}
    Object.keys(values).forEach((k) => {
      const v = values[k]
      if (v instanceof File) return
      if (v === null || v === undefined || v === '') return
      payload[k] = v
    })
    payload[form.employeeField] = emp.value.name
    if (emp.value.department) payload.department = emp.value.department

    if (form.children) {
      payload[form.children.name] = rows.value.map((r) => {
        const o = {}
        form.children.columns.forEach((c) => {
          const v = r[c.name]
          o[c.name] = v === '' || v === undefined ? null : v
        })
        return o
      })
    }

    const created = await createDoc(form.doctype, payload)

    const attaches = []
    ;(form.sections || []).concat(form.sectionsAfter || []).forEach((s) =>
      s.fields.forEach((f) => {
        if (f.type === 'attach' && values[f.name] instanceof File) {
          attaches.push({ field: f.name, file: values[f.name] })
        }
      })
    )
    for (const a of attaches) {
      try {
        const up = await uploadFile(a.file, form.doctype, created.name, a.field)
        const url = up && up.file_url ? up.file_url : ''
        if (url) await updateDoc(form.doctype, created.name, { [a.field]: url })
      } catch (e) {
        /* 附件失敗不阻斷流程 */
      }
    }

    if (submit) {
      const doc = await getDoc(form.doctype, created.name)
      await applyWorkflow(form.doctype, doc, '送出申請')
    }

    router.replace({ name: 'doc', params: { key: form.key, name: created.name } })
  } catch (e) {
    error.value = e.message || '送出失敗'
  } finally {
    busy.value = false
  }
}
</script>
