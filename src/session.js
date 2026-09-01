import { reactive } from 'vue'
import { getLoggedUser, myEmployee } from './api'

export const session = reactive({
  user: null, // null = 尚未判斷；'Guest' = 未登入
  employee: null,
  ready: false,
})

export async function ensureSession(force) {
  if (session.ready && !force) return session.user
  try {
    const u = await getLoggedUser()
    session.user = u
    if (u && u !== 'Guest') {
      try {
        session.employee = await myEmployee()
      } catch (e) {
        session.employee = null
      }
    } else {
      session.employee = null
    }
  } catch (e) {
    session.user = 'Guest'
    session.employee = null
  }
  session.ready = true
  return session.user
}

export function isLoggedIn() {
  return session.user && session.user !== 'Guest'
}

export function resetSession() {
  session.user = 'Guest'
  session.employee = null
  session.ready = true
}
