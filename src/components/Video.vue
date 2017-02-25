<template>
  <div class="pv2">
    <div id="player" :class="`absolute top-0 left-0 z-9999${lights ? ' shadow-2' : ''}`"></div>
    <div v-if="!playerInit" class="w-100 bg-light-gray absolute top-0 left-0" style="padding-bottom: 576px"></div>
    <div class="absolute controls z-9999">
      <button :class="`f5 fw6 dib ba b--black-20 ${lights ? 'bg-dark-gray' : 'bg-blue'} white pointer ph3 pv2`" @click="$store.commit('UPDATE_LIGHTS', !lights)"><i class="fa fa-lightbulb-o" aria-hidden="true"></i> Toggle lights</button>
      <button :class="`f5 fw6 dib ba b--black-20 ${lights ? 'bg-dark-gray' : 'bg-blue'} white pointer ph3 pv2`" @click="wsCreateRoom" v-if="room === ''"><i class="fa fa-globe" aria-hidden="true"></i> Watch with others</button>
      <reactotron v-show="room !== ''" class="dib v-mid ml1 nowrap overflow-hidden reactotron" @emoji="handleEmoji" />
    </div>
  </div>
</template>

<script>
  /* global Clappr, LevelSelector, ChromecastPlugin */
  import $script from 'scriptjs'
  import anime from 'animejs'
  import api, {LOCALE, VERSION} from 'lib/api'
  import WS from 'lib/websocket'
  import emoji from 'lib/emoji'
  import Reactotron from './Reactotron'

  export default {
    name: 'video',
    props: ['data', 'poster', 'id', 'seek'],
    components: {Reactotron},
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
      },
      lights () {
        return this.$store.state.lights
      }
    },
    mounted () {
      $script('//cdn.jsdelivr.net/g/clappr@0.2.65,clappr.chromecast-plugin@0.0.5,clappr.level-selector@0.1.10', () => {
        const self = this
        this.playerInit = true
        this.player = new Clappr.Player({
          parent: this.$el.querySelector('#player'),
          width: '1024px',
          height: '576px',
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
          },
          events: {
            onReady () {
              const container = document.createElement('div')
              self.reactions = document.createElement('div')
              self.reactions.className = 'reaction-canvas absolute absolute--fill z-9999 tl'
              self.tron = self.$el.querySelector('.reactotron').cloneNode(true)
              self.tron.style.cssText = ''
              self.tron.className = `${self.tron.className} z-max player-tron`
              Array.from(self.tron.querySelectorAll('img')).forEach((e) => e.onclick = self.handleEmoji.bind(self, e.id, true))
              container.appendChild(self.reactions)
              container.appendChild(self.tron)
              this.core.el.appendChild(container)
            }
          }
        })

        this.playback = this.player.core.getCurrentContainer().playback
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
        this.playback = this.player.core.getCurrentContainer().playback
        if (this.room !== '') {
          this.playback.on(Clappr.Events.PLAYBACK_PLAY_INTENT, this.wsHandlePlay)
        }
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
        while (this.events.length > 0) {
          const {socket} = WS
          const event = this.events[0]

          if (event.id !== socket.id) {
            const playing = this.player.isPlaying()
            if (event.method === 'pause' && !playing) {
              return
            }

            this.lastEvent = event
            this.player[event.method](...event.args)
          } else {
            socket.emit('player-event', event)
          }
          this.events.shift()
        }
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
      handleFullscreen (full) {
        const method = full ? 'add' : 'remove'
        this.tron.classList[method]('full')
      },
      handleShowControls () {
        this.tron.classList.add('show')
      },
      handleHideControls () {
        this.tron.classList.remove('show')
      },
      handleEmoji (name, show) {
        if (show) {
          this.player.core.showMediaControl()
        }
        WS.socket.emit('emoji', name)
        this.displayEmoji(name)
      },
      displayEmoji (name) {
        const selected = emoji.find((e) => e.name === name)
        if (!selected) return

        const core = this.player.core.el
        const el = document.createElement('img')
        const rand = anime.random(0, core.clientHeight - 25)
        el.className = 'emoji absolute'
        el.style.transform = `translateX(${core.clientWidth + 50}px) translateY(${rand}px)`
        el.src = selected.image ? selected.image : `https://cdn.frankerfacez.com/emoticon/${selected.id}/1`
        this.reactions.appendChild(el)

        anime({
          targets: el,
          translateX: -35,
          translateY: [
            {value: `+=${Math.random() > 0.5 ? -15 : 15}`, easing: 'easeInOutSine'},
            {value: `+=${Math.random() > 0.5 ? -15 : 15}`, easing: 'easeInOutSine'},
            {value: `+=${Math.random() > 0.5 ? -15 : 15}`, easing: 'easeInOutSine'},
          ],
          easing: 'linear',
          duration: 1750,
          complete: () => {
            this.reactions.removeChild(el)
          }
        })
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
        socket.on('emoji', this.displayEmoji)

        this.wsHandlePlay = this.wsHandleEvent.bind(this, 'play')
        this.wsHandlePause = this.wsHandleEvent.bind(this, 'pause')
        this.wsHandleSeek = this.wsHandleEvent.bind(this, 'seek')
        this.playback.on(Clappr.Events.PLAYBACK_PLAY_INTENT, this.wsHandlePlay)
        this.player.on(Clappr.Events.PLAYER_PAUSE, this.wsHandlePause)
        this.player.on(Clappr.Events.PLAYER_SEEK, this.wsHandleSeek)
        this.player.on(Clappr.Events.PLAYER_FULLSCREEN, this.handleFullscreen)
        this.player.core.mediaControl.on(Clappr.Events.MEDIACONTROL_SHOW, this.handleShowControls)
        this.player.core.mediaControl.on(Clappr.Events.MEDIACONTROL_HIDE, this.handleHideControls)
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
        socket.off('emoji', this.displayEmoji)

        this.playback.off(Clappr.Events.PLAYBACK_PLAY_INTENT, this.wsHandlePlay)
        this.player.off(Clappr.Events.PLAYER_PAUSE, this.wsHandlePause)
        this.player.off(Clappr.Events.PLAYER_SEEK, this.wsHandleSeek)
        this.player.off(Clappr.Events.PLAYER_FULLSCREEN, this.handleFullscreen)
        this.player.core.mediaControl.off(Clappr.Events.MEDIACONTROL_SHOW, this.handleShowControls)
        this.player.core.mediaControl.off(Clappr.Events.MEDIACONTROL_HIDE, this.handleHideControls)
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
  .reaction-canvas {
    overflow: hidden;
    pointer-events: none;
  }

  .player-tron {
    transform: translateY(-40px);
    transition: transform 0.4s ease-out;
    padding-top: 5px !important;
    background: linear-gradient(rgba(0, 0, 0, .4), transparent);
    display: none !important;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .player-tron.full {
    display: block !important;
  }
  .player-tron.show {
    transform: translateY(0);
  }
</style>

<style scoped>
  .controls {
    top: 588px;
  }
</style>
