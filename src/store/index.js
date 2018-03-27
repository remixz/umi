import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v4'
import axios, {isCancel} from 'axios'

import api, {ACCESS_TOKEN, DEVICE_TYPE, LOCALE, VERSION, UMI_SERVER} from 'lib/api'
import {getUuid} from 'lib/auth'
import Firebase from 'lib/firebase'

const MEDIA_FIELDS = 'media.media_id,media.available,media.available_time,media.collection_id,media.collection_name,media.series_id,media.type,media.episode_number,media.name,media.description,media.screenshot_image,media.created,media.duration,media.playhead,media.bif_url'
const SERIES_FIELDS = 'series.series_id,series.name,series.portrait_image,series.landscape_image,series.description,series.in_queue'

Vue.use(Vuex)

function handleError (err, reject) {
  if (!isCancel(err)) {
    store.commit('SET_ERROR', true)
    reject(err)
  }
}

const store = new Vuex.Store({
  state: {
    auth: localStorage.getItem('auth') ? (
      JSON.parse(localStorage.getItem('auth'))
    ) : (
      {}
    ),
    malAuth: localStorage.getItem('malAuth') ? (
      JSON.parse(localStorage.getItem('malAuth'))
    ) : (
      {}
    ),
    locales: [],
    series: {},
    seriesCollections: {},
    collections: {},
    collectionMedia: {},
    media: {},
    searchIds: [],
    searchQuery: '',
    queueData: [],
    initialHistory: [],
    recent: [],
    roomId: '',
    roomConnected: false,
    roomMenu: false,
    roomData: {},
    connectedCount: 0,
    lights: false,
    error: false,
    expiredSession: '',
    guestMessage: false,
    readExtension: localStorage.getItem('readExtension') ? true : false
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
          const resp = await api({route: 'start_session', params, noCancel: true})
          const data = resp.data.data
          commit('UPDATE_AUTH', {
            session_id: data.session_id,
            country: data.country_code.toLowerCase(),
            token: data.auth,
            expires: data.expires
          })
          resolve()
          // fetch locales in the background
          const localeResp = await api({
            route: 'list_locales',
            version: '1',
            params: {session_id: data.session_id},
            noCancel: true
          })
          commit('UPDATE_LOCALES', localeResp.data.data.locales)
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
      form.append('locale', LOCALE())
      form.append('version', VERSION)

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({method: 'post', route: 'login', data: form})
          if (resp.data.error) throw resp

          const data = resp.data.data
          if (data.user.premium.indexOf('anime') === -1) {
            return reject(new Error('You must have a premium Crunchyroll account to use Umi.'))
          }
          commit('UPDATE_AUTH', {
            token: data.auth,
            expires: data.expires,
            username: data.user.username
          })
          commit('SET_EXPIRED_SESSION', '')
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    logout ({commit, dispatch, state}, didExpire) {
      return new Promise(async (resolve, reject) => {
        try {
          if (didExpire) {
            commit('SET_EXPIRED_SESSION', state.auth.username)
          }
          commit('REMOVE_AUTH')
          await dispatch('startSession')
          resolve()
          commit('SET_INITIAL_HISTORY', [])
          commit('SET_QUEUE_DATA', [])
        } catch (err) {
          handleError(err, reject)
        }
      })
    },

    authenticateMal ({commit, state}, {username, password}) {
      return new Promise(async (resolve, reject) => {
        try {
          const {data} = await axios.post(`${UMI_SERVER}/mal/login`, {username, password})
          if (data.status === 'ok') {
            commit('UPDATE_MAL', data)
            resolve()
          } else {
            reject(new Error(data.error))
          }
        } catch (err) {
          reject(err)
        }
      })
    },

    getQueueInfo ({commit, state}, force) {
      const params = {
        session_id: state.auth.session_id,
        media_types: 'anime|drama',
        fields: [MEDIA_FIELDS, SERIES_FIELDS].join(',')
      }

      if (state.queueData.length > 0 && !force) return Promise.resolve()

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'queue', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          commit('SET_QUEUE_DATA', data)
          data.forEach((d) => {
            commit('ADD_SERIES', d.series)
            commit('ADD_MEDIA', d.most_likely_media)
            commit('ADD_MEDIA', d.last_watched_media)
          })
          resolve()
        } catch (err) {
          handleError(err, reject)
        }
      })
    },

    getHistoryInfo ({commit, state}, {limit = 24, offset = 0} = {}) {
      const params = {
        session_id: state.auth.session_id,
        media_types: 'anime|drama',
        fields: [MEDIA_FIELDS, SERIES_FIELDS].join(','),
        limit,
        offset
      }

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'recently_watched', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          if (offset === 0) {
            commit('SET_INITIAL_HISTORY', data)
          }
          data.forEach((d) => {
            commit('ADD_SERIES', d.series)
            commit('ADD_COLLECTION', d.collection)
            commit('ADD_MEDIA', d.media)
          })
          resolve(data)
        } catch (err) {
          handleError(err, reject)
        }
      })
    },

    getRecentInfo ({commit, state}) {
      const params = {
        session_id: state.auth.session_id,
        media_type: 'anime',
        fields: [MEDIA_FIELDS, 'media.series_name', 'series.most_recent_media'].join(','),
        limit: 50,
        offset: 0,
        filter: 'updated'
      }

      if (state.recent.length > 0) return Promise.resolve(state.recent)

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'list_series', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          data.forEach((d) => {
            commit('ADD_MEDIA', d.most_recent_media)
          })
          commit('SET_RECENT', data)
          resolve(data)
        } catch (err) {
          handleError(err, reject)
        }
      })
    },

    search ({commit, state}, q) {
      const params = {
        session_id: state.auth.session_id,
        classes: 'series',
        limit: 999,
        offset: 0,
        media_types: 'anime|drama',
        fields: SERIES_FIELDS,
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
          handleError(err, reject)
        }
      })
    },

    getSeriesInfo ({commit, state}, id) {
      const params = {
        session_id: state.auth.session_id,
        series_id: id,
        fields: SERIES_FIELDS
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
          handleError(err, reject)
        }
      })
    },

    updateSeriesQueue ({commit, state, dispatch}, {id, queueStatus}) {
      const form = new FormData()
      form.append('session_id', state.auth.session_id)
      form.append('locale', LOCALE())
      form.append('version', VERSION)
      form.append('series_id', id)

      commit('UPDATE_SERIES_QUEUE', {id, queueStatus})

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({method: 'post', route: queueStatus ? 'add_to_queue' : 'remove_from_queue', data: form})
          if (resp.data.error) throw resp

          dispatch('getQueueInfo', true)
          resolve()
        } catch (err) {
          handleError(err, reject)
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
          handleError(err, reject)
        }
      })
    },

    getMediaForCollection ({commit, state}, id) {
      const params = {
        session_id: state.auth.session_id,
        collection_id: id,
        include_clips: 1,
        limit: 5000,
        offset: 0,
        fields: MEDIA_FIELDS
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
          handleError(err, reject)
        }
      })
    },

    getCollectionInfo ({commit, state}, id) {
      const params = {
        session_id: state.auth.session_id,
        collection_id: id
      }

      if (state.media[id]) return Promise.resolve()

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await api({route: 'info', params})
          if (resp.data.error) throw resp

          const data = resp.data.data
          commit('ADD_COLLECTION', data)
          resolve()
        } catch (err) {
          handleError(err, reject)
        }
      })
    },

    getMediaInfo ({commit, state, dispatch}, id) {
      const params = {
        session_id: state.auth.session_id,
        media_id: id,
        fields: MEDIA_FIELDS
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
          handleError(err, reject)
        }
      })
    },

    leaveRoom ({state, commit}) {
      const roomRef = Firebase.getRef(`/rooms/${state.roomId}`)
      const usersRef = Firebase.getRef(`/roomUsers/${state.roomId}`)
      const connectedRef = Firebase.getRef(`/roomUsers/${state.roomId}/${Firebase.app.auth().currentUser.uid}`)

      roomRef.off()
      usersRef.off()
      connectedRef.remove()

      commit('UPDATE_ROOM', '')
      commit('UPDATE_CONNECTED', false)
      commit('UPDATE_CONNECTED_COUNT', 1)
    },

    enterRoom ({state, commit}, {id = uuid()}) {
      commit('UPDATE_ROOM', id)

      return new Promise(async (resolve, reject) => {
        try {
          await Firebase.init()
          const roomRef = Firebase.getRef(`/rooms/${id}`)
          const usersRef = Firebase.getRef(`/roomUsers/${id}`)
          const connectedRef = Firebase.getRef(`/roomUsers/${id}/${Firebase.app.auth().currentUser.uid}`)
          await connectedRef.set(true)
          connectedRef.onDisconnect().remove()

          const room = await roomRef.once('value')
          const value = room.val() || {
            playing: false,
            syncedTime: 0,
            host: Firebase.app.auth().currentUser.uid,
            hostOnly: false,
            route: {
              path: state.route.path,
              name: state.route.name
            }
          }

          if (!room.val()) {
            await roomRef.set(value)
          }

          roomRef.on('value', (snapshot) => {
            commit('UPDATE_ROOM_DATA', snapshot.val())
          })

          commit('UPDATE_CONNECTED', true)
          usersRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
              commit('UPDATE_CONNECTED_COUNT', Object.keys(snapshot.val()).length)
            }
          })

          resolve(value)
        } catch (err) {
          reject(err)
        }
      })
    },

    updateRoomData ({state, getters}, obj) {
      if (state.roomData.hostOnly && !getters.isRoomHost) return Promise.resolve()

      return new Promise(async (resolve, reject) => {
        try {
          const roomRef = Firebase.getRef(`/rooms/${state.roomId}`)

          await roomRef.update(obj)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },

    flashGuestMessage ({state, commit}) {
      if (state.guestMessage) return

      commit('UPDATE_GUEST_MESSAGE', true)
      setTimeout(() => {
        commit('UPDATE_GUEST_MESSAGE', false)
      }, 5000)
    }
  },

  mutations: {
    UPDATE_AUTH (state, obj) {
      const updated = Object.assign({}, state.auth, obj)
      localStorage.setItem('auth', JSON.stringify(updated))
      Vue.set(state, 'auth', updated)
    },

    UPDATE_LOCALES (state, arr) {
      state.locales = arr
    },

    REMOVE_AUTH (state) {
      localStorage.removeItem('auth')
      Vue.set(state, 'auth', {})
    },

    UPDATE_MAL (state, obj) {
      const updated = Object.assign({}, state.malAuth, obj)
      localStorage.setItem('malAuth', JSON.stringify(updated))
      Vue.set(state, 'malAuth', updated)
    },

    REMOVE_MAL_AUTH (state) {
      localStorage.removeItem('malAuth')
      Vue.set(state, 'malAuth', {})
    },

    SET_SEARCH_IDS (state, arr) {
      state.searchIds = arr
    },

    SET_SEARCH_QUERY (state, str) {
      state.searchQuery = str
    },

    SET_QUEUE_DATA (state, arr) {
      Vue.set(state, 'queueData', arr)
    },

    SET_INITIAL_HISTORY (state, arr) {
      Vue.set(state, 'initialHistory', arr)
    },

    SET_RECENT (state, arr) {
      Vue.set(state, 'recent', arr)
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

    UPDATE_ROOM_DATA (state, obj) {
      Vue.set(state, 'roomData', obj)
    },

    UPDATE_CONNECTED (state, bool) {
      state.roomConnected = bool
    },

    UPDATE_CONNECTED_COUNT (state, int) {
      state.connectedCount = int
    },

    UPDATE_ROOM_MENU (state, bool) {
      state.roomMenu = bool
    },

    UPDATE_SERIES_QUEUE (state, {id, queueStatus}) {
      Vue.set(state.series[id], 'in_queue', queueStatus)
    },

    UPDATE_LIGHTS (state, bool) {
      state.lights = bool
    },

    SET_ERROR (state, bool) {
      state.error = bool
    },

    SET_EXPIRED_SESSION (state, str) {
      state.expiredSession = str
    },

    UPDATE_GUEST_MESSAGE (state, bool) {
      state.guestMessage = bool
    },

    SET_READ_EXTENSION (state) {
      localStorage.setItem('readExtension', 'true')
      state.readExtension = true
    }
  },

  getters: {
    isRoomHost (state) {
      return state.roomConnected && state.roomData.host === Firebase.app.auth().currentUser.uid
    }
  }
})

export default store
