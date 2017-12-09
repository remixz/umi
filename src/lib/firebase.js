import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const config = {
  apiKey: 'AIzaSyCUktVh5mjlAyr-_1uksCLpuESY5vF-jwg',
  authDomain: 'umi-player.firebaseapp.com',
  databaseURL: 'https://umi-player.firebaseio.com',
  projectId: 'umi-player',
  storageBucket: 'umi-player.appspot.com',
  messagingSenderId: '688413516796'
}

const Firebase = {
  refs: {},
  connected: false,

  init () {
    if (this.connected) return Promise.resolve()

    return new Promise(async (resolve, reject) => {
      try {
        if (!this.app) this.app = firebase.initializeApp(config)
        await this.app.auth().signInAnonymously()
        this.connected = true
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  },

  getRef (str) {
    if (!this.refs[str]) {
      this.refs[str] = this.app.database().ref(str)
    }

    return this.refs[str]
  },

  install (Vue) {
    Object.defineProperty(Vue.prototype, '$firebase', {
      get () {
        return Firebase
      }
    })
  }
}

export default Firebase
