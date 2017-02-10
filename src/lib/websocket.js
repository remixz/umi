const io = require('socket.io-client')

const SERVER = process.env.NODE_ENV === 'production' ? 'https://umi-watch-api.now.sh' : 'http://localhost:3001'

const WS = {
  connected: false,
  room: '',
  init () {
    this.socket = io.connect(SERVER)
    this.socket.on('connect', () => {
      this.connected = true
    })
  }
}

export default WS
