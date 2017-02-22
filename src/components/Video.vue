<template>
  <div>
    <div id="player"></div>
    <div v-if="!playerInit" class="w-100" style="padding-bottom: 62.5%"></div>
    <div class="mt2">
      <button class="f5 fw6 dib ba b--black-20 bg-blue white pointer ph3 pv2" @click="wsCreateRoom" v-if="room === ''"><i class="fa fa-globe" aria-hidden="true"></i> Watch with others</button>
    </div>
  </div>
</template>

<script>
  /* global Clappr, LevelSelector, ChromecastPlugin */
  import $script from 'scriptjs'
  import api, {LOCALE, VERSION} from 'lib/api'
  import WS from 'lib/websocket'

  export default {
    name: 'video',
    props: ['data', 'poster', 'id', 'seek'],
    data () {
      return {
        playerInit: false,
        events: [],
        lastEvent: null
      }
    },
    computed: {
      streamUrl () {
        return this.data.streams[0].url
      },
      room () {
        return this.$store.state.roomId
      }
    },
    mounted () {
      $script('//cdn.jsdelivr.net/g/clappr@0.2.65,clappr.chromecast-plugin@0.0.5,clappr.level-selector@0.1.10', () => {
        this.playerInit = true
        this.player = new Clappr.Player({
          parent: this.$el.querySelector('#player'),
          width: '100%',
          height: 'auto',
          source: this.streamUrl,
          poster: this.poster,
          disableVideoTagContextMenu: true,
          plugins: [LevelSelector, ChromecastPlugin],
          levelSelectorConfig: {
            title: 'Quality',
            labels: {
              4: '1080p',
              3: '720p',
              2: '480p',
              1: '360p',
              0: '240p'
            }
          }
        })

        this.player.on(Clappr.Events.PLAYER_ENDED, () => {
          this.logTime(null, this.player.getDuration())
          this.$emit('ended')
        })
        this.player.on(Clappr.Events.PLAYER_PLAY, () => {
          this.$emit('play')
        })
        this.player.on(Clappr.Events.PLAYER_PAUSE, () => {
          this.logTime()
        })
        if (this.seek && this.seek !== 0) {
          this.player.seek(this.seek)
        }

        if (this.$route.query.joinRoom) {
          this.wsJoinRoom()
        } else if (this.room !== '') {
          this.wsRegisterEvents()
        }
      })
    },
    watch: {
      data () {
        this.player.configure({
          source: this.streamUrl,
          poster: this.poster
        })
      },
      room (curr) {
        if (curr === '') {
          this.wsDestroy()
        }
      },
      id (curr, old) {
        this.logTime(old)
      },
      seek () {
        if (this.seek !== 0) {
          this.player.seek(this.seek)
          this.player.play()
        }
      },
      events () {
        if (this.events.length <= 0) return
        const {socket} = WS
        const event = this.events[0]

        if (event.id !== socket.id) {
          this.lastEvent = event
          this.player[event.method](...event.args)
        } else {
          socket.emit('player-event', event)
        }
        this.events.shift()
      }
    },
    methods: {
      handleInputClick ({target}) {
        target.select()
      },
      logTime (id, t) {
        const time = t || Math.round(this.player.getCurrentTime())
        if (time !== 0 && process.env.NODE_ENV === 'production') {
          const data = new FormData()
          data.append('session_id', this.$store.state.auth.session_id)
          data.append('event', 'playback_status')
          data.append('playhead', time)
          data.append('media_id', id || this.id)
          data.append('locale', LOCALE)
          data.append('version', VERSION)

          api({
            method: 'post',
            route: 'log',
            data
          })
        }
      },
      wsCreateRoom () {
        this.$store.dispatch('createRoom')
        this.wsRegisterEvents()
      },
      wsJoinRoom () {
        const time = parseInt(this.$route.query.wsTime, 10)
        const playing = this.$route.query.wsPlaying === 'true'

        if (time > 0) {
          this.player.seek(time)
        }

        if (playing) {
          this.player.play()
        }

        this.$router.replace({path: this.$route.path, query: {}})
        this.wsRegisterEvents()
      },
      wsRegisterEvents () {
        const {socket} = WS

        socket.on('user-joined', this.wsOnJoined)
        socket.on('player-event', this.wsOnEvent)

        this.wsHandlePlay = this.wsHandleEvent.bind(this, 'play')
        this.wsHandlePause = this.wsHandleEvent.bind(this, 'pause')
        this.wsHandleSeek = this.wsHandleEvent.bind(this, 'seek')
        this.player.on(Clappr.Events.PLAYER_PLAY, this.wsHandlePlay)
        this.player.on(Clappr.Events.PLAYER_PAUSE, this.wsHandlePause)
        this.player.on(Clappr.Events.PLAYER_SEEK, this.wsHandleSeek)
      },
      wsOnJoined () {
        this.$store.commit('UPDATE_CONNECTED_COUNT', this.$store.state.connectedCount + 1)
        WS.socket.emit('update-status', {
          time: Math.round(this.player.getCurrentTime()),
          playing: this.player.isPlaying(),
          path: this.$route.path,
          name: this.$route.name
        })
      },
      wsOnEvent (ev) {
        this.events.push(ev)
      },
      wsHandleEvent (method, ...args) {
        const {socket} = WS
        if (this.lastEvent) {
          this.lastEvent = null
          return
        }

        this.events.push({
          id: socket.id, method, args
        })
      },
      wsDestroy () {
        const {socket} = WS

        socket.off('user-joined', this.wsOnJoined)
        socket.off('player-event', this.wsOnEvent)

        this.player.off(Clappr.Events.PLAYER_PLAY, this.wsHandlePlay)
        this.player.off(Clappr.Events.PLAYER_PAUSE, this.wsHandlePause)
        this.player.off(Clappr.Events.PLAYER_SEEK, this.wsHandleSeek)
      }
    },
    beforeDestroy () {
      this.logTime()
      if (this.room !== '') {
        WS.socket.emit('player-event', {
          id: WS.socket.id,
          method: 'pause',
          args: []
        })
      }
      this.player.destroy()
      this.playerInit = false
    }
  }
</script>

<style>
  /* Fix the player container to take up 100% width and to calculate its height based on its children. */
  [data-player] {
      position: relative;
      width: 100%;
      height: auto;
      margin: 0;
  }

  /* Fix the video container to take up 100% width and to calculate its height based on its children. */
  [data-player] .container[data-container] {
      width: 100%;
      height: auto;
      position: relative;
  }

  /* Fix the media-control element to take up the entire size of the player. */
  [data-player] .media-control[data-media-control] {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
  }

  /* Fix the video element to take up 100% width and to calculate its height based on its natural aspect ratio. */
  [data-player] video {
      position: relative;
      display: block;
      width: 100%;
      height: auto;
  }
</style>
