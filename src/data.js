import { FORMS } from './forms'
import { listDocs, myPending } from './api'
import { session } from './session'
import { allSettings } from './registry'

export const LIST_FIELDS = [
  'name',
  'workflow_state',
  'owner',
  'employee_name',
  'creation',
  'modified',
  'leave_type',
  'from_date',
  'to_date',
  'total_days',
  'total_amount',
  'total_estimate',
  'purpose',
  'supplier',
  'destination',
  'days',
]

export function formOf(d) {
  if (d && d._form_key && FORMS[d._form_key]) return FORMS[d._form_key]
  if (d && d._doctype) return FORM_LIST.find((f) => f.doctype === d._doctype) || FORM_LIST[0]
  return FORM_LIST[0]
}

export async function loadPending() {
  const rows = await myPending()
  return (rows || []).map((d) => Object.assign({}, d, { _doctype: d._doctype }))
}

export async function loadMine() {
  const settings = allSettings()
  const groups = await Promise.all(
    settings.map(async (s) => {
      try {
        const rows = await listDocs(
          s.doctype,
          [['owner', '=', session.user]],
          LIST_FIELDS,
          'modified desc',
          50
        )
        return rows.map((r) => Object.assign({}, r, { _form_key: s.key, _doctype: s.doctype }))
      } catch (e) {
        return []
      }
    })
  )
  const all = groups.flat()
  all.sort((a, b) => String(b.modified || '').localeCompare(String(a.modified || '')))
  return all
}
