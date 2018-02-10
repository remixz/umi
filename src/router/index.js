import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import Analytics from 'vue-analytics'
import store from '../store'
import {authGuard, loginGuard} from 'lib/auth'
import {cancelCurrentRequests} from 'lib/api'

import Dashboard from 'pages/Dashboard'
import Migrate from 'pages/Migrate'
import Queue from 'pages/Queue'
import Settings from 'pages/Settings'
import History from 'pages/History'
import Search from 'pages/Search'
import Login from 'pages/Login'
import Series from 'pages/Series'
import Media from 'pages/Media'
import Room from 'pages/Room'
import Changelog from 'pages/Changelog'

Vue.use(Router)
Vue.use(Meta)

const router = new Router({
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      beforeEnter: authGuard
    },
    {
      path: '/migrate',
      name: 'migrate',
      component: Migrate
    },
    {
      path: '/queue',
      name: 'queue',
      component: Queue,
      beforeEnter: authGuard
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      beforeEnter: authGuard
    },
    {
      path: '/history',
      name: 'history',
      component: History,
      beforeEnter: authGuard
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: loginGuard
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
      beforeEnter: authGuard
    },
    {
      path: '/series/:id',
      name: 'series',
      component: Series,
      beforeEnter: authGuard
    },
    {
      path: '/series/:seriesId/:id',
      name: 'media',
      component: Media,
      beforeEnter: authGuard
    },
    {
      path: '/room/:id',
      name: 'room',
      component: Room,
      beforeEnter: authGuard
    },
    {
      path: '/changelog',
      name: 'changelog',
      component: Changelog,
      beforeEnter: authGuard
    }
  ]
})

router.beforeEach((to, from, next) => {
  // cancel navigation when in host-only mode and client is not the host
  if (store.state.roomConnected && store.state.roomData.hostOnly && !store.getters.isRoomHost && to.name !== from.name) {
    store.dispatch('flashGuestMessage')
    return next(false)
  }

  // on all page changes aside from the initial load, we cancel in progress requests
  if (from.name && from.name !== to.name) {
    cancelCurrentRequests()
  }
  next()
})

if (process.env.NODE_ENV === 'production') {
  Vue.use(Analytics, {id: 'UA-46859303-4', router})
}

export default router
