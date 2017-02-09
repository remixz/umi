import uuid from 'uuid/v4'

export const authCheck = {
  beforeCreate () {
    const {$store: {state: {auth}}, $router, $route} = this

    if (!auth.username) {
      $router.replace(`/login?next=${encodeURIComponent($route.fullPath)}`)
    }
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
