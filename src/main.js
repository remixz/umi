import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import WS from 'lib/websocket'
import VTooltip from 'v-tooltip'
import 'babel-polyfill'

Vue.use(VTooltip)

sync(store, router)
WS.init()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
