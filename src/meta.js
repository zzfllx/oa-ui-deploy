// 将 Frappe DocType meta 转换为前端通用渲染结构
// 这是「元数据驱动」的核心：表单/列表/详情都从 meta 渲染，无需前端为每张单写代码。

const LAYOUT_TYPES = ['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Fold', 'Heading']

// Frappe 系統欄位，不應出現在通用表單裡
const SYSTEM_FIELDS = [
  'name', 'owner', 'creation', 'modified', 'modified_by', 'docstatus',
  'workflow_state', 'amended_from', 'amended_by', 'idx',
  '_user_tags', '_comments', '_assign', '_likes', '_seen',
  'parent', 'parentfield', 'parenttype',
]

// Frappe fieldtype -> 前端控件类型
export function fieldTypeToControl(ft) {
  switch (ft) {
    case 'Select':
      return 'select'
    case 'Date':
    case 'Datetime':
      return 'date'
    case 'Time':
      return 'text'
    case 'Int':
    case 'Float':
    case 'Percent':
      return 'number'
    case 'Currency':
      return 'currency'
    case 'Check':
      return 'check'
    case 'Link':
      return 'link'
    case 'Attach':
    case 'Attach Image':
      return 'attach'
    case 'Table':
      return 'table'
    case 'Text':
    case 'Long Text':
    case 'Small Text':
    case 'Text Editor':
      return 'textarea'
    case 'Password':
      return 'text'
    default:
      return 'text'
  }
}

export function parseOptions(str) {
  if (!str) return []
  return String(str)
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s && s !== ' ')
}

// 将 meta.fields 转为 [{title, fields:[...]}]，按 Section Break 分组；子表单独收集
export function metaToSections(meta) {
  const sections = []
  const tables = []
  let cur = { title: '', fields: [] }
  ;(meta.fields || []).forEach((f) => {
    if (LAYOUT_TYPES.indexOf(f.fieldtype) >= 0) {
      if (f.fieldtype === 'Section Break') {
        if (cur.fields.length || cur.title) sections.push(cur)
        cur = { title: f.label || '', fields: [] }
      }
      return
    }
    if (f.fieldtype === 'Table') {
      tables.push({
        name: f.fieldname,
        label: f.label || f.fieldname,
        doctype: f.options,
        addLabel: '新增一筆',
      })
      return
    }
    if (f.hidden) return
    if (SYSTEM_FIELDS.indexOf(f.fieldname) >= 0) return
    cur.fields.push({
      name: f.fieldname,
      label: f.label || f.fieldname,
      type: fieldTypeToControl(f.fieldtype),
      required: !!f.reqd,
      readonly: !!f.read_only || !!f.fetch_from,
      options: parseOptions(f.options),
      placeholder: f.placeholder || '',
      linkDoctype: f.fieldtype === 'Link' ? f.options : null,
      default: f.default || null,
      inList: !!f.in_list_view,
    })
  })
  if (cur.fields.length || cur.title) sections.push(cur)
  return { sections, tables }
}

// 把子表 meta 转成可编辑网格的列定义
export function childColumns(meta) {
  const cols = []
  ;(meta.fields || []).forEach((f) => {
    if (LAYOUT_TYPES.indexOf(f.fieldtype) >= 0) return
    if (f.fieldtype === 'Table') return
    if (f.hidden) return
    cols.push({
      name: f.fieldname,
      label: f.label || f.fieldname,
      type: fieldTypeToControl(f.fieldtype),
      required: !!f.reqd,
      options: parseOptions(f.options),
      linkDoctype: f.fieldtype === 'Link' ? f.options : null,
      width: f.fieldtype === 'Currency' || f.fieldtype === 'Int' || f.fieldtype === 'Float' ? 'w-28' : 'flex-1 min-w-[8rem]',
    })
  })
  return cols
}
