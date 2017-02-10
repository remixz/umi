import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import Analytics from 'vue-analytics'

const Home = () => import('pages/home')
const History = () => import('pages/History')
const Search = () => import('pages/Search')
const Login = () => import('pages/Login')
const Series = () => import('pages/Series')
const Media = () => import('pages/Media')
const Room = () => import('pages/Room')

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
    },
    {
      path: '/room/:id',
      name: 'room',
      component: Room
    }
  ]
})
