const CSRF_STORE = { token: '' }

function headers(withJson) {
  const h = { Accept: 'application/json' }
  if (withJson) h['Content-Type'] = 'application/json'
  if (CSRF_STORE.token) h['X-Frappe-CSRF-Token'] = CSRF_STORE.token
  return h
}

async function refreshCsrf() {
  // 優先走自建 API（最穩定）
  try {
    const r = await fetch('/api/method/oa_core.api.csrf_token', { credentials: 'include' })
    if (r.ok) {
      const d = await r.json()
      if (d && d.message) {
        CSRF_STORE.token = d.message
        return d.message
      }
    }
  } catch (e) {
    /* 往下走備援 */
  }
  // 備援：從後台頁面 HTML 中擷取的 csrf_token
  try {
    const r = await fetch('/app', { credentials: 'include' })
    if (!r.ok) return ''
    const html = await r.text()
    let m = html.match(/window\.csrf_token\s*=\s*["']([^"']+)["']/)
    if (!m) m = html.match(/["']csrf_token["']\s*:\s*["']([^"']+)["']/)
    if (m) {
      CSRF_STORE.token = m[1]
      return m[1]
    }
  } catch (e) {
    /* ignore */
  }
  return ''
}

async function parse(r) {
  let data = null
  try {
    data = await r.json()
  } catch (e) {
    data = null
  }
  if (!r.ok) {
    let msg = '請求失敗'
    if (data && data.message) msg = data.message
    else if (data && data.exception) msg = data.exception
    const err = new Error(msg)
    err.status = r.status
    err.server_messages = data && data.server_messages ? data.server_messages : null
    throw err
  }
  return data
}

async function request(method, url, body, retried) {
  const isForm = body instanceof FormData
  const opts = {
    method,
    credentials: 'include',
    headers: headers(!isForm),
  }
  if (body !== undefined && body !== null) {
    opts.body = isForm ? body : JSON.stringify(body)
  }
  const r = await fetch(url, opts)
  if (r.status === 403 && !retried) {
    const t = await refreshCsrf()
    if (t) return request(method, url, body, true)
  }
  return parse(r)
}

export const api = {
  get: (url, params) => {
    let u = url
    if (params) u += '?' + new URLSearchParams(params).toString()
    return request('GET', u)
  },
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  del: (url) => request('DELETE', url),
  refreshCsrf,
}

/* ---------------- 登入 / 登出 ---------------- */

export async function login(usr, pwd) {
  const r = await fetch('/api/method/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'usr=' + encodeURIComponent(usr) + '&pwd=' + encodeURIComponent(pwd),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    let msg = '登入失敗'
    if (data.message) msg = data.message
    if (data.server_messages) {
      try {
        const arr = JSON.parse(data.server_messages)
        if (Array.isArray(arr) && arr.length) msg = arr[0].message || arr[0]
      } catch (e) {
        /* keep */
      }
    }
    throw new Error(msg)
  }
  await refreshCsrf()
  return data
}

export async function logout() {
  try {
    await api.post('/api/method/logout', {})
  } catch (e) {
    /* ignore */
  }
  CSRF_STORE.token = ''
}

export async function getLoggedUser() {
  const d = await api.get('/api/method/frappe.auth.get_logged_user')
  return d && d.message ? d.message : 'Guest'
}

/* ---------------- 文件操作 ---------------- */

export function listDocs(doctype, filters, fields, orderBy, limit) {
  return api.get('/api/resource/' + encodeURIComponent(doctype), {
    fields: JSON.stringify(fields),
    filters: JSON.stringify(filters),
    order_by: orderBy || 'modified desc',
    limit_page_length: limit || 50,
  }).then((d) => d.data || [])
}

export function getDoc(doctype, name) {
  return api
    .get('/api/resource/' + encodeURIComponent(doctype) + '/' + encodeURIComponent(name))
    .then((d) => d.data)
}

export function createDoc(doctype, data) {
  return api.post('/api/resource/' + encodeURIComponent(doctype), { data }).then((d) => d.data)
}

export function updateDoc(doctype, name, data) {
  return api
    .put('/api/resource/' + encodeURIComponent(doctype) + '/' + encodeURIComponent(name), { data })
    .then((d) => d.data)
}

export function applyWorkflow(doctype, doc, action) {
  return api
    .post('/api/method/frappe.model.workflow.apply_workflow', {
      doc: JSON.stringify(doc),
      action: action,
    })
    .then((d) => d.message || d)
}

export function getTransitions(doc) {
  return api
    .post('/api/method/frappe.model.workflow.get_transitions', { doc: JSON.stringify(doc) })
    .then((d) => d.message || [])
}

export function linkOptions(doctype) {
  return api
    .get('/api/resource/' + encodeURIComponent(doctype), {
      fields: JSON.stringify(['name']),
      limit_page_length: 200,
    })
    .then((d) => (d.data || []).map((x) => x.name))
}

export function uploadFile(file, doctype, docname, fieldname) {
  const fd = new FormData()
  fd.append('file', file, file.name)
  fd.append('is_private', '0')
  fd.append('doctype', doctype)
  fd.append('docname', docname)
  if (fieldname) fd.append('fieldname', fieldname)
  return api.post('/api/method/upload_file', fd).then((d) => d.message || d)
}

export function addComment(doctype, name, content) {
  return api
    .post('/api/method/frappe.desk.form.utils.add_comment', {
      reference_doctype: doctype,
      reference_name: name,
      content: content,
      comment_email: '',
      comment_by: '',
    })
    .then((d) => d.message || d)
}

/* 自建後端 API（oa_core.api） */
export function formSettings() {
  return api.post('/api/method/oa_core.api.form_settings', {}).then((d) => d.message || [])
}

export function getMeta(doctype) {
  return api.post('/api/method/oa_core.api.oa_meta', { doctype }).then((d) => d.message || null)
}

export function docStats() {
  return api.post('/api/method/oa_core.api.doc_stats', {}).then((d) => d.message || {})
}

export function docTimeline(doctype, name) {
  return api
    .post('/api/method/oa_core.api.doc_timeline', { doctype: doctype, name: name })
    .then((d) => d.message || [])
}

export function myPending() {
  return api.post('/api/method/oa_core.api.my_pending', {}).then((d) => d.message || [])
}

export function myTodoCounts() {
  return api.post('/api/method/oa_core.api.todo_counts', {}).then((d) => d.message || {})
}

export function myEmployee() {
  return api.post('/api/method/oa_core.api.my_employee', {}).then((d) => d.message || null)
}
