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

export function getUuid () {
  const localId = localStorage.getItem('umi-uuid')
  if (localId) {
    return localId
  } else {
    const id = uuid().toUpperCase()
    localStorage.setItem('umi-uuid', id)
    return id
  }
}
