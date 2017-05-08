import uuid from 'uuid/v4'
import store from '../store'

export function authGuard (to, from, next) {
  const loggedIn = !!store.state.auth.username
  if (loggedIn) {
    next()
  } else {
    next(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
}

export function loginGuard (to, from, next) {
  const noAuth = !store.state.auth.username
  if (noAuth) {
    next()
  } else {
    next('/')
  }
}

let localId = localStorage.getItem('umi-uuid')
export function getUuid () {
  if (!localId) {
    localId = uuid().toUpperCase()
    localStorage.setItem('umi-uuid', localId)
  }

  return localId
}
