<template>
  <div>
    <h3 v-if="expiredLink">your share link has expired, ask for a new link</h3>
    <div id="player"></div>
    <div class="mt2">
      <button @click="wsCreateRoom" v-if="room === ''">create room</button>
      <div v-else>
        Send to friends: <input type="text" v-model="roomUrl">
      </div>
    </div>
  </div>
</template>

<script>
  /* global Clappr, LevelSelector, ChromecastPlugin */
  import uuid from 'uuid/v4'
  import api, {LOCALE, VERSION} from 'lib/api'
  import WS from 'lib/websocket'

  export default {
    name: 'video',
    props: ['data', 'poster', 'id', 'seek'],
    data () {
      return {
        room: '',
        expiredLink: false
      }
    },
    computed: {
      streamUrl () {
        return this.data.streams[0].url
      },
      roomUrl () {
        return window.location.origin + this.$route.path + '?room=' + this.room
      }
    },
    mounted () {
      this.player = new Clappr.Player({
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

      this.player.attachTo(this.$el.querySelector('#player'))
      this.player.on(Clappr.Events.PLAYER_ENDED, () => {
        this.logTime(null, this.player.getDuration())
      })
      if (this.seek && this.seek !== 0) {
        this.player.seek(this.seek)
      }

      if (this.$route.query.room) {
        this.wsJoinRoom(this.$route.query.room)
      }
    },
    watch: {
      data () {
        this.player.configure({
          source: this.streamUrl,
          poster: this.poster
        })
      },
      id (curr, old) {
        this.logTime(old)
      },
      seek () {
        if (this.seek !== 0) {
          this.player.seek(this.seek)
          this.player.play()
        }
      }
    },
    methods: {
      logTime (id, t) {
        const time = t || Math.round(this.player.getCurrentTime())
        if (time !== 0) {
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
        const {socket} = WS

        const id = `umi//${uuid()}`
        socket.emit('join-room', id)
        this.room = id
        WS.room = id
        this.wsRegisterEvents()
      },
      wsJoinRoom (id) {
        const {socket} = WS

        socket.emit('join-room', id)
        this.room = id
        WS.room = id
        this.wsRegisterEvents()
        socket.once('update-status', (obj) => {
          if (obj.mediaId !== this.$route.params.id) {
            this.expiredLink = true
            this.wsDestroy()
            return
          }

          if (obj.time !== 0) {
            this.player.seek(obj.time)
          }

          if (obj.playing) {
            this.player.play()
          }
        })
      },
      wsRegisterEvents () {
        const {socket} = WS

        socket.on('user-joined', () => {
          socket.emit('update-status', {
            time: this.player.getCurrentTime(),
            playing: this.player.isPlaying(),
            mediaId: this.$route.params.id
          })
        })
        socket.on('play', this.wsOnPlay)
        socket.on('pause', this.wsOnPause)
        socket.on('seek', this.wsOnSeek)

        this.player.on(Clappr.Events.PLAYER_PLAY, this.wsHandlePlay)
        this.player.on(Clappr.Events.PLAYER_PAUSE, this.wsHandlePause)
        this._seekFunction = this.wsHandleSeek.bind(this, true)
        this.player.on(Clappr.Events.PLAYER_SEEK, this._seekFunction)
      },
      wsHandlePlay () {
        const {socket} = WS

        socket.emit('play')
      },
      wsOnPlay() {
        this.player.play()
      },
      wsHandlePause () {
        const {socket} = WS

        socket.emit('pause')
      },
      wsOnPause () {
        this.player.pause()
      },
      wsHandleSeek (emit, time) {
        const {socket} = WS

        this.player.off(Clappr.Events.PLAYER_SEEK, this._seekFunction)
        this._seekFunction = this.wsHandleSeek.bind(this, true)
        this.player.on(Clappr.Events.PLAYER_SEEK, this._seekFunction)
        if (emit) {
          socket.emit('seek', time)          
        }
      },
      wsOnSeek (time) {
        this.player.off(Clappr.Events.PLAYER_SEEK, this._seekFunction)
        this._seekFunction = this.wsHandleSeek.bind(this, false)
        this.player.on(Clappr.Events.PLAYER_SEEK, this._seekFunction)
        this.player.seek(time)
      },
      wsDestroy () {
        const {socket} = WS

        socket.off('play', this.wsOnPlay)
        socket.off('pause', this.wsOnPause)
        socket.off('seek', this.wsOnSeek)

        this.player.off(Clappr.Events.PLAYER_PLAY, this.wsHandlePlay)
        this.player.off(Clappr.Events.PLAYER_PAUSE, this.wsHandlePause)
        this.player.off(Clappr.Events.PLAYER_SEEK, this._seekFunction)

        socket.emit('leave-room')
        WS.room = ''
        this.room = ''
      }
    },
    beforeDestroy () {
      this.logTime()
      this.wsDestroy()
      this.player.destroy()
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
