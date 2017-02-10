import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import Analytics from 'vue-analytics'

import Home from 'pages/Home'
import History from 'pages/History'
import Search from 'pages/Search'
import Login from 'pages/Login'
import Series from 'pages/Series'
import Media from 'pages/Media'

Vue.use(Router)
Vue.use(Meta)

if (process.env.NODE_ENV === 'production') {
  Vue.use(Analytics, {id: 'UA-46859303-4'})
}

export default new Router({
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
      component: Home
    },
    {
      path: '/history',
      name: 'history',
      component: History
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/search',
      name: 'search',
      component: Search
    },
    {
      path: '/series/:id',
      name: 'series',
      component: Series
    },
    {
      path: '/series/:seriesId/:id',
      name: 'media',
      component: Media
    }
  ]
})
