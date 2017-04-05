import io from 'socket.io-client'
import { UMI_SERVER } from './api'

const WS = {
  connected: false,
  init () {
    this.socket = io.connect(UMI_SERVER)
    this.socket.on('connect', () => {
      this.connected = true
    })
  },
  install (Vue) {
    this.init()
    Object.defineProperty(Vue.prototype, '$socket', {
      get () { return WS.socket }
    })
  }
}

export default WS
