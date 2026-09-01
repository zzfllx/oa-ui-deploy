export const FORMS = {
  leave: {
    key: 'leave',
    doctype: 'OA Leave Application',
    label: '請假申請',
    short: '請假',
    icon: 'calendar',
    iconBg: 'bg-[#eaf2ff]',
    iconColor: '#1e6fd9',
    bar: 'bg-[#1e6fd9]',
    employeeField: 'employee',
    daysRange: ['from_date', 'to_date'],
    daysField: 'total_days',
    sections: [
      {
        title: '請假資料',
        fields: [
          {
            name: 'leave_type',
            label: '假別',
            type: 'select',
            required: true,
            options: ['事假', '病假', '特休', '婚假', '喪假', '產假', '公假'],
          },
          { name: 'from_date', label: '開始日期', type: 'date', required: true, half: true },
          { name: 'to_date', label: '結束日期', type: 'date', required: true, half: true },
          { name: 'total_days', label: '請假天數', type: 'number', readonly: true, unit: '天' },
        ],
      },
      {
        title: '事由',
        fields: [
          { name: 'reason', label: '事由說明', type: 'textarea', required: true },
          { name: 'attachment', label: '證明文件', type: 'attach', hint: '病假請上傳診斷證明' },
        ],
      },
    ],
  },

  expense: {
    key: 'expense',
    doctype: 'OA Expense Claim',
    label: '費用報銷',
    short: '報銷',
    icon: 'card',
    iconBg: 'bg-[#fff3e6]',
    iconColor: '#d97a1a',
    bar: 'bg-[#d97a1a]',
    employeeField: 'employee',
    amountField: 'total_amount',
    sections: [
      {
        title: '報銷資料',
        fields: [
          { name: 'posting_date', label: '申請日期', type: 'date', required: true, half: true },
          { name: 'total_amount', label: '報銷總額', type: 'currency', readonly: true, half: true },
        ],
      },
      {
        title: '用途',
        fields: [{ name: 'purpose', label: '用途說明', type: 'textarea', required: true }],
      },
    ],
    children: {
      name: 'expense_items',
      label: '費用明細',
      addLabel: '新增一筆費用',
      sumField: 'total_amount',
      columns: [
        { name: 'expense_date', label: '日期', type: 'date', required: true, width: 'w-32' },
        {
          name: 'category',
          label: '類別',
          type: 'select',
          required: true,
          options: ['交通費', '餐費', '住宿', '交際費', '辦公用品', '其他'],
          width: 'w-32',
        },
        { name: 'description', label: '說明', type: 'text', width: 'flex-1 min-w-[8rem]' },
        { name: 'amount', label: '金額', type: 'currency', required: true, width: 'w-28' },
        { name: 'invoice_no', label: '發票號碼', type: 'text', width: 'w-32' },
      ],
    },
    sectionsAfter: [
      {
        title: '撥款資訊',
        fields: [{ name: 'bank_account', label: '匯款帳號', type: 'text' }],
      },
    ],
  },

  purchase: {
    key: 'purchase',
    doctype: 'OA Purchase Request',
    label: '採購申請',
    short: '採購',
    icon: 'cart',
    iconBg: 'bg-[#e9f7f0]',
    iconColor: '#17915f',
    bar: 'bg-[#17915f]',
    employeeField: 'requesting_employee',
    amountField: 'total_estimate',
    sections: [
      {
        title: '採購資料',
        fields: [
          { name: 'required_date', label: '需求日期', type: 'date', required: true, half: true },
          { name: 'supplier', label: '建議供應商', type: 'text', half: true },
          {
            name: 'total_estimate',
            label: '預估總額',
            type: 'currency',
            readonly: true,
            half: true,
          },
        ],
      },
    ],
    children: {
      name: 'items',
      label: '採購明細',
      addLabel: '新增一項物品',
      sumField: 'total_estimate',
      rowAmount: true,
      columns: [
        { name: 'item_name', label: '品項', type: 'text', required: true, width: 'flex-1 min-w-[8rem]' },
        { name: 'specification', label: '規格', type: 'text', width: 'flex-1 min-w-[7rem]' },
        { name: 'qty', label: '數量', type: 'number', required: true, width: 'w-20' },
        { name: 'unit_price', label: '單價', type: 'currency', required: true, width: 'w-28' },
        { name: 'amount', label: '小計', type: 'currency', readonly: true, width: 'w-28' },
      ],
    },
    sectionsAfter: [
      {
        title: '用途',
        fields: [{ name: 'purpose', label: '用途說明', type: 'textarea', required: true }],
      },
    ],
  },

  travel: {
    key: 'travel',
    doctype: 'OA Travel Request',
    label: '出差申請',
    short: '出差',
    icon: 'send',
    iconBg: 'bg-[#f1ecfb]',
    iconColor: '#6b4fbb',
    bar: 'bg-[#6b4fbb]',
    employeeField: 'employee',
    daysRange: ['from_date', 'to_date'],
    daysField: 'days',
    sections: [
      {
        title: '出差資料',
        fields: [
          { name: 'destination', label: '目的地', type: 'text', required: true, half: true },
          { name: 'is_overseas', label: '國外出差', type: 'check', half: true },
          { name: 'from_date', label: '出發日期', type: 'date', required: true, half: true },
          { name: 'to_date', label: '返回日期', type: 'date', required: true, half: true },
          { name: 'days', label: '出差天數', type: 'number', readonly: true, unit: '天' },
        ],
      },
      {
        title: '行程',
        fields: [
          { name: 'purpose', label: '出差事由', type: 'textarea', required: true },
          {
            name: 'transport',
            label: '交通方式',
            type: 'select',
            options: ['高鐵', '飛機', '火車', '自用車', '其他'],
            half: true,
          },
          { name: 'estimated_expense', label: '預估費用', type: 'currency', half: true },
        ],
      },
    ],
  },
}

export const FORM_LIST = Object.values(FORMS)

export function formByDoctype(doctype) {
  return FORM_LIST.find((f) => f.doctype === doctype) || null
}

export function allFields(form) {
  const out = []
  ;(form.sections || []).forEach((s) => out.push(...s.fields))
  ;(form.sectionsAfter || []).forEach((s) => out.push(...s.fields))
  return out
}

export const STATE_STYLE = {
  草稿: 'bg-[#f2f3f5] text-[#646a73] ring-[#dfe1e5]',
  待核准: 'bg-[#fff7e6] text-[#a35b00] ring-[#ffd591]',
  待財務核准: 'bg-[#fff7e6] text-[#a35b00] ring-[#ffd591]',
  待總經理核准: 'bg-[#fff1f0] text-[#a8071a] ring-[#ffa39e]',
  已核准: 'bg-[#eaf7f0] text-[#137a4d] ring-[#a3e0c0]',
  已駁回: 'bg-[#f2f3f5] text-[#8f959e] ring-[#dfe1e5]',
}

export function isPending(state) {
  return ['待核准', '待財務核准', '待總經理核准'].indexOf(state) >= 0
}

export function summarize(form, doc) {
  if (form.key === 'leave') {
    return {
      title: (doc.leave_type || '請假') + ' ' + (doc.total_days || 0) + ' 天',
      subtitle: (doc.from_date || '') + (doc.to_date && doc.to_date !== doc.from_date ? ' 至 ' + doc.to_date : ''),
    }
  }
  if (form.key === 'expense') {
    return {
      title: '報銷 ' + money(doc.total_amount),
      subtitle: doc.purpose || '',
    }
  }
  if (form.key === 'purchase') {
    return {
      title: '採購 ' + money(doc.total_estimate),
      subtitle: doc.purpose || doc.supplier || '',
    }
  }
  return {
    title: '出差 ' + (doc.destination || ''),
    subtitle: (doc.from_date || '') + ' 至 ' + (doc.to_date || '') + ' ・ ' + (doc.days || 0) + ' 天',
  }
}

export function money(v) {
  const n = Number(v || 0)
  return 'NT$ ' + n.toLocaleString('zh-TW', { maximumFractionDigits: 0 })
}

export function daysBetween(a, b) {
  if (!a || !b) return 0
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  const diff = Math.round((d2 - d1) / 86400000) + 1
  return diff > 0 ? diff : 0
}

export function relTime(t) {
  if (!t) return ''
  const d = new Date(String(t).replace(' ', 'T'))
  if (isNaN(d.getTime())) return String(t).slice(0, 10)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '剛剛'
  if (diff < 3600) return Math.floor(diff / 60) + ' 分鐘前'
  if (diff < 86400) return Math.floor(diff / 3600) + ' 小時前'
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + ' 天前'
  const p = (n) => String(n).padStart(2, '0')
  return p(d.getMonth() + 1) + '-' + p(d.getDate())
}

export function absTime(t) {
  if (!t) return ''
  return String(t).slice(5, 16)
}
