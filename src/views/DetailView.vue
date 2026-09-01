<template>
  <div v-if="loading" class="oa-card divide-y divide-[#f0f1f3]">
    <div v-for="i in 3" :key="i" class="h-20 animate-pulse bg-[#fafbfc]"></div>
  </div>

  <div v-else-if="doc">
    <!-- 單據標題 -->
    <div class="oa-card mb-4 p-4">
      <div class="flex items-start gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :style="{ background: color + '1a' }">
          <Icon :name="icon" :size="18" :color="color" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="truncate text-[16px] font-medium text-[#1f2329]">{{ summary.title }}</div>
          <div class="mt-0.5 truncate text-[13px] text-[#8f959e]">{{ summary.subtitle || '—' }}</div>
        </div>
        <StatusBadge :state="doc.workflow_state" />
      </div>

      <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#ebedf0] pt-3 text-[12px] text-[#8f959e]">
        <span>單號 {{ doc.name }}</span>
        <span>申請人 {{ doc.employee_name || doc.owner }}</span>
        <span v-if="doc.department">部門 {{ doc.department }}</span>
        <span>建立 {{ absTime(doc.creation) }}</span>
      </div>
    </div>

    <!-- 審批進度 -->
    <section class="mb-4">
      <div class="oa-title mb-3"><span class="oa-bar"></span>審批進度</div>
      <div class="oa-card p-4">
        <Timeline :events="events" />
      </div>
    </section>

    <!-- 舊布局表單內容 -->
    <template v-if="legacy">
      <div v-for="(sec, si) in allSections" :key="si" class="mb-4">
        <div class="oa-title mb-2"><span class="oa-bar"></span>{{ sec.title }}</div>
        <div class="oa-card divide-y divide-[#f2f3f5]">
          <div v-for="f in sec.fields" :key="f.name" class="flex items-start justify-between gap-4 px-4 py-2.5">
            <span class="shrink-0 text-[13px] text-[#8f959e]">{{ f.label }}</span>
            <a v-if="f.type === 'attach' && doc[f.name]" :href="doc[f.name]" target="_blank" rel="noreferrer" class="flex items-center gap-1 text-[14px] text-brand hover:underline">
              <Icon name="clip" :size="14" /> 查看附件
            </a>
            <span v-else class="text-right text-[14px] text-[#1f2329]" v-html="fmt(f, doc[f.name])"></span>
          </div>
        </div>
      </div>

      <div v-if="legacy.children" class="mb-4">
        <div class="oa-title mb-2">
          <span class="oa-bar"></span>{{ legacy.children.label }}
          <span v-if="legacy.amountField" class="ml-auto text-[14px] font-medium text-brand">{{ money(doc[legacy.amountField]) }}</span>
        </div>
        <div class="oa-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] text-[13px]">
              <thead class="bg-[#fafbfc] text-[#8f959e]">
                <tr>
                  <th v-for="c in legacy.children.columns" :key="c.name" class="whitespace-nowrap px-4 py-2 text-left font-normal">{{ c.label }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#f2f3f5]">
                <tr v-for="(row, i) in childRows" :key="i">
                  <td v-for="c in legacy.children.columns" :key="c.name" class="whitespace-nowrap px-4 py-2.5 text-[#1f2329]">{{ cellText(c, row[c.name]) }}</td>
                </tr>
                <tr v-if="!childRows.length">
                  <td :colspan="legacy.children.columns.length" class="px-4 py-5 text-center text-[#a5a9b0]">無明細</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- 通用 meta 表單內容 -->
    <template v-else>
      <div v-for="(sec, si) in allSections" :key="si" class="mb-4">
        <div class="oa-title mb-2"><span class="oa-bar"></span>{{ sec.title || '內容' }}</div>
        <div class="oa-card divide-y divide-[#f2f3f5]">
          <div v-for="f in sec.fields" :key="f.name" class="flex items-start justify-between gap-4 px-4 py-2.5">
            <span class="shrink-0 text-[13px] text-[#8f959e]">{{ f.label }}</span>
            <a v-if="f.type === 'attach' && doc[f.name]" :href="doc[f.name]" target="_blank" rel="noreferrer" class="flex items-center gap-1 text-[14px] text-brand hover:underline">
              <Icon name="clip" :size="14" /> 查看附件
            </a>
            <span v-else class="text-right text-[14px] text-[#1f2329]">{{ dispField(f, doc[f.name]) }}</span>
          </div>
        </div>
      </div>

      <div v-for="(tb, ti) in childDefs" :key="'c' + ti" class="mb-4">
        <div class="oa-title mb-2"><span class="oa-bar"></span>{{ tb.label }}</div>
        <div class="oa-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] text-[13px]">
              <thead class="bg-[#fafbfc] text-[#8f959e]">
                <tr>
                  <th v-for="c in tb.columns" :key="c.name" class="whitespace-nowrap px-4 py-2 text-left font-normal">{{ c.label }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#f2f3f5]">
                <tr v-for="(row, i) in tb.rows" :key="i">
                  <td v-for="c in tb.columns" :key="c.name" class="whitespace-nowrap px-4 py-2.5 text-[#1f2329]">{{ dispField(c, row[c.name]) }}</td>
                </tr>
                <tr v-if="!tb.rows.length">
                  <td :colspan="tb.columns.length" class="px-4 py-5 text-center text-[#a5a9b0]">無明細</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <p v-if="error" class="mb-4 rounded-lg bg-[#fff1f0] px-3.5 py-2.5 text-[13px] text-[#a8071a] ring-1 ring-inset ring-[#ffa39e]">{{ error }}</p>

    <div v-if="actions.length" class="fixed bottom-0 left-0 right-0 border-t border-[#ebedf0] bg-white p-4 md:static md:rounded-lg md:border md:border-[#ebedf0]">
      <div class="mx-auto w-full max-w-5xl">
        <label class="oa-label">審批意見（{{ needComment ? '駁回必填' : '選填' }}）</label>
        <textarea v-model="comment" class="oa-input mb-3" rows="2" placeholder="可於此補充說明"></textarea>
        <div class="flex gap-3">
          <button v-for="a in actions" :key="a" class="oa-btn flex-1" :class="a === '駁回' ? 'oa-btn-ghost !text-[#d03050]' : 'oa-btn-primary'" :disabled="busy" @click="act(a)">
            {{ busy ? '處理中…' : a }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import Timeline from '../components/Timeline.vue'
import { FORMS, money, summarize, absTime } from '../forms'
import { getDoc, getTransitions, applyWorkflow, addComment, docTimeline, getMeta } from '../api'
import { metaToSections, childColumns } from '../meta'
import { resolve } from '../registry'

const route = useRoute()
const setting = computed(() => resolve(route.params.key))
const legacy = computed(() => (setting.value ? setting.value.legacy : null))
const doctype = computed(() => (setting.value ? setting.value.doctype : null))
const icon = computed(() => (setting.value ? setting.value.icon : 'file'))
const color = computed(() => (setting.value ? setting.value.color : '#646a73'))

const doc = ref(null)
const events = ref([])
const actions = ref([])
const allSections = ref([])
const childRows = ref([])
const childDefs = ref([])
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const comment = ref('')

const needComment = computed(() => actions.value.indexOf('駁回') >= 0)
const summary = computed(() =>
  legacy.value && doc.value ? summarize(legacy.value, doc.value) : { title: doc.value ? doc.value.name : '', subtitle: setting.value ? setting.value.label : '' }
)

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}
function cellText(c, v) {
  if (v === null || v === undefined || v === '') return '—'
  if (c.type === 'currency') return money(v)
  if (c.type === 'check') return v ? '是' : '否'
  return v
}
function fmt(f, v) {
  if (v === null || v === undefined || v === '') return '<span class="text-[#c9cdd4]">—</span>'
  if (f.type === 'attach') {
    const name = String(v).split('/').pop()
    return '<a class="text-brand hover:underline" href="' + esc(v) + '" target="_blank" rel="noreferrer">' + esc(name) + '</a>'
  }
  if (f.type === 'currency') return esc(money(v))
  if (f.type === 'check') return v ? '是' : '否'
  if (f.type === 'number') return esc(v) + (f.unit ? ' ' + f.unit : '')
  if (f.type === 'textarea') return '<span class="whitespace-pre-wrap text-left">' + esc(v) + '</span>'
  return esc(v)
}
function dispField(f, v) {
  if (v === null || v === undefined || v === '') return '—'
  if (f.type === 'currency') return money(v)
  if (f.type === 'check') return v ? '是' : '否'
  if (f.type === 'number') return esc(v) + (f.unit ? ' ' + f.unit : '')
  if (typeof v === 'string' && v.startsWith('/files')) return v.split('/').pop()
  return esc(v)
}

async function load() {
  if (!doctype.value) {
    loading.value = false
    error.value = '找不到對應表單'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const d = await getDoc(doctype.value, route.params.name)
    doc.value = d
    const trs = await getTransitions(d).catch(() => [])
    const set = []
    ;(trs || []).forEach((t) => {
      const a = t.action || t
      if (set.indexOf(a) < 0) set.push(a)
    })
    actions.value = set
    events.value = await docTimeline(doctype.value, route.params.name).catch(() => [])

    if (legacy.value) {
      allSections.value = (legacy.value.sections || []).concat(legacy.value.sectionsAfter || [])
      childRows.value = legacy.value.children && doc.value[legacy.value.children.name] ? doc.value[legacy.value.children.name] : []
    } else {
      const m = await getMeta(doctype.value)
      const built = metaToSections(m)
      allSections.value = built.sections
      const defs = []
      for (const tb of built.tables) {
        try {
          const cm = await getMeta(tb.doctype)
          tb.columns = childColumns(cm)
          tb.rows = doc.value[tb.name] || []
          defs.push(tb)
        } catch (e) {
          /* ignore */
        }
      }
      childDefs.value = defs
    }
  } catch (e) {
    error.value = e.message || '載入失敗'
  } finally {
    loading.value = false
  }
}

async function act(action) {
  if (action === '駁回' && !comment.value.trim()) {
    error.value = '駁回時請填寫意見'
    return
  }
  busy.value = true
  error.value = ''
  try {
    const fresh = await getDoc(doctype.value, route.params.name)
    await applyWorkflow(doctype.value, fresh, action)
    if (comment.value.trim()) {
      try {
        await addComment(doctype.value, route.params.name, '【' + action + '】' + comment.value.trim())
      } catch (e) {
        /* 留言失敗不阻斷 */
      }
    }
    comment.value = ''
    await load()
  } catch (e) {
    error.value = e.message || '操作失敗'
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
