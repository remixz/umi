import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import Analytics from 'vue-analytics'
import {authGuard, loginGuard} from 'lib/auth'

import Home from 'pages/Home'
import History from 'pages/History'
import Search from 'pages/Search'
import Login from 'pages/Login'
import Series from 'pages/Series'
import Media from 'pages/Media'
import Room from 'pages/Room'

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
      name: 'home',
      component: Home,
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
    }
  ]
})

if (process.env.NODE_ENV === 'production') {
  Vue.use(Analytics, {id: 'UA-46859303-4', router})
}

export default router
