import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import Firebase from 'lib/firebase'
import VTooltip from 'v-tooltip'

Vue.use(VTooltip)
Vue.use(Firebase)
sync(store, router)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

if (process.env.NODE_ENV === 'production') {
  const runtime = require('offline-plugin/runtime')
  runtime.install({
    onUpdateReady () {
      runtime.applyUpdate()
    },
    onUpdated () {
      localStorage.setItem('updated', Date.now())
      location.reload()
    }
  })
}
