import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v4'

import api, {ACCESS_TOKEN, DEVICE_TYPE, LOCALE, VERSION} from 'lib/api'
import {getUuid} from 'lib/auth'
import WS from 'lib/websocket'

Vue.use(Vuex)

// use Vue.set for adding series/collections/media
const store = new Vuex.Store({
  state: {
    auth: localStorage.getItem('auth') ? (
      JSON.parse(localStorage.getItem('auth'))
    ) : (
      {}
    ),
    series: {},
    seriesCollections: {},
    collections: {},
    collectionMedia: {},
    media: {},
    searchIds: [],
    searchQuery: '',
    roomId: '',
    roomConnected: false
  },

  actions: {
    startSession ({commit, state}) {
      const params = {
        access_token: ACCESS_TOKEN,
        device_type: DEVICE_TYPE,
        device_id: getUuid()
      }

      if (state.auth.token) {
        params.auth = state.auth.token
      }

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'start_session', params})
          const data = resp.data.data
          commit('UPDATE_AUTH', {
            session_id: data.session_id,
            token: data.auth,
            expires: data.expires
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    login ({commit, state, dispatch}, {username, password}) {
      const form = new FormData()
      form.append('account', username)
      form.append('password', password)
      form.append('session_id', state.auth.session_id)
      form.append('locale', LOCALE)
      form.append('version', VERSION)

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({method: 'post', route: 'login', data: form})
          if (resp.data.error) throw resp

          const data = resp.data.data
          if (data.user.premium.indexOf('anime') === -1) {
            return reject('Your Crunchyroll account must be premium to use Umi.')
          }
          commit('UPDATE_AUTH', {
            token: data.auth,
            expires: data.expires,
            username: data.user.username
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    getQueueInfo ({commit, state}) {
      const params = {
        session_id: state.auth.session_id,
        media_types: 'anime|drama'
      }

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'queue', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          data.forEach((d) => {
            commit('ADD_SERIES', d.series)
            commit('ADD_MEDIA', d.most_likely_media)
            commit('ADD_MEDIA', d.last_watched_media)
          })
          resolve(data)
        } catch (err) {
          reject(err)
        }
      })
    },

    getHistoryInfo ({commit, state}) {
      const params = {
        session_id: state.auth.session_id,
        media_types: 'anime|drama'
      }

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'recently_watched', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          data.forEach((d) => {
            commit('ADD_SERIES', d.series)
            commit('ADD_COLLECTION', d.collection)
            commit('ADD_MEDIA', d.media)
          })
          resolve(data)
        } catch (err) {
          reject(err)
        }
      })
    },

    search ({commit, state}, q) {
      const params = {
        session_id: state.auth.session_id,
        classes: 'series',
        limit: 50,
        offset: 0,
        media_types: 'anime|drama',
        q
      }

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'autocomplete', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          data.forEach((d) => {
            commit('ADD_SERIES', d)
          })
          commit('SET_SEARCH_IDS', data.map((d) => d.series_id))
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    getSeriesInfo ({commit, state}, id) {
      const params = {
        session_id: state.auth.session_id,
        series_id: id
      }

      if (state.series[id]) return Promise.resolve()

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'info', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          commit('ADD_SERIES', data)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    getCollectionsForSeries ({commit, state}, id) {
      const params = {
        session_id: state.auth.session_id,
        series_id: id,
        limit: 5000,
        offset: 0
      }

      if (state.seriesCollections[id]) return Promise.resolve()

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'list_collections', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          data.forEach((d) => {
            commit('ADD_COLLECTION', d)
          })
          commit('ADD_SERIES_COLLECTION', {id, arr: data.map((d) => d.collection_id)})
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    getMediaForCollection ({commit, state}, id) {
      const params = {
        session_id: state.auth.session_id,
        collection_id: id,
        include_clips: 1,
        limit: 5000,
        offset: 0
      }

      if (state.collectionMedia[id]) return Promise.resolve()

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'list_media', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          data.forEach((d) => {
            commit('ADD_MEDIA', d)
          })
          commit('ADD_COLLECTION_MEDIA', {id, arr: data.map((d) => d.media_id)})
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    getMediaInfo ({commit, state}, id) {
      const params = {
        session_id: state.auth.session_id,
        media_id: id
      }

      if (state.media[id]) return Promise.resolve()

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'info', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          commit('ADD_MEDIA', data)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    createRoom ({commit}) {
      const room = `umi//${uuid()}`
      commit('UPDATE_ROOM', room)
      WS.socket.emit('join-room', room)
    },

    joinRoom ({commit}, id) {
      const room = `umi//${id}`
      commit('UPDATE_ROOM', room)
      WS.socket.emit('join-room', room)
    },

    leaveRoom ({commit}) {
      commit('UPDATE_ROOM', '')
      WS.socket.emit('leave-room')
    }
  },

  mutations: {
    UPDATE_AUTH (state, obj) {
      const updated = Object.assign({}, state.auth, obj)
      localStorage.setItem('auth', JSON.stringify(updated))
      Vue.set(state, 'auth', updated)
    },

    DELETE_AUTH (state) {
      localStorage.removeItem('auth')
      location.pathname = '/'
    },

    SET_SEARCH_IDS (state, arr) {
      state.searchIds = arr
    },

    SET_SEARCH_QUERY (state, str) {
      state.searchQuery = str
    },

    ADD_SERIES (state, obj) {
      if (obj && obj.series_id) Vue.set(state.series, obj.series_id, obj)
    },

    ADD_SERIES_COLLECTION (state, {id, arr}) {
      if (arr) Vue.set(state.seriesCollections, id, arr)
    },

    ADD_COLLECTION (state, obj) {
      if (obj && obj.collection_id) Vue.set(state.collections, obj.collection_id, obj)
    },

    ADD_COLLECTION_MEDIA (state, {id, arr}) {
      if (arr) Vue.set(state.collectionMedia, id, arr)
    },

    ADD_MEDIA (state, obj) {
      if (obj && obj.media_id) Vue.set(state.media, obj.media_id, obj)
    },

    UPDATE_ROOM (state, str) {
      state.roomId = str
    },

    UPDATE_CONNECTED (state, bool) {
      state.roomConnected = bool
    }
  }
})

export default store
