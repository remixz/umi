import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import WS from 'lib/websocket'
import VTooltip from 'v-tooltip'
import 'babel-polyfill'

Vue.use(VTooltip)
Vue.use(WS)
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
    onUpdateReady () { runtime.applyUpdate() },
    onUpdated () { store.commit('SET_UPDATE_AVAILABLE') }
  })
}
