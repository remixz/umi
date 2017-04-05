<template>
  <div class="pv2">
    <div id="player" :class="`bg-black w-100 absolute left-0 z-9999${lights ? ' shadow-2' : ''} player-top-offset`">
      <div v-if="playerInit && showBlur && !lights" class="w-100 player-height absolute top-0 left-0 overflow-hidden o-80">
        <img :src="poster" class="player-background" draggable="false">
      </div>
    </div>
    <div v-if="!playerInit" class="bg-black absolute w-100 left-0 player-height player-top-offset">
      <div class="bg-dark-gray center player-width player-height"></div>
    </div>
    <reactotron v-show="room !== ''" class="dib v-mid ml1 nowrap overflow-hidden reactotron relative z-9999" style="top: 565px;" @emoji="handleEmoji" />
  </div>
</template>

<script>
  /* global Clappr, LevelSelector */
  import $script from 'scriptjs'
  import anime from 'animejs'
  import api, {LOCALE, VERSION} from 'lib/api'
  import emoji from 'lib/emoji'
  import Reactotron from './Reactotron'

  export default {
    name: 'video',
    props: ['data', 'poster', 'id', 'seek', 'duration'],
    components: {Reactotron},
    data () {
      return {
        playerInit: false,
        events: [],
        lastEvent: null,
        showBlur: true
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
      $script('//cdn.jsdelivr.net/g/clappr@0.2.65,clappr.level-selector@0.1.10', () => {
        const self = this
        this.playerInit = true
        this.player = new Clappr.Player({
          parent: this.$el.querySelector('#player'),
          width: '1024px',
          height: '576px',
          source: this.streamUrl,
          poster: this.poster,
          disableVideoTagContextMenu: true,
          plugins: [LevelSelector],
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
              if (self.container) {
                this.core.el.appendChild(self.container)
                return
              }
              self.container = document.createElement('div')
              self.reactions = document.createElement('div')
              self.reactions.className = 'reaction-canvas absolute absolute--fill z-9999 tl'
              self.tron = self.$el.querySelector('.reactotron').cloneNode(true)
              self.tron.style.cssText = ''
              self.tron.className = `${self.tron.className} z-max player-tron`
              Array.from(self.tron.querySelectorAll('img')).forEach((e) => { e.onclick = self.handleEmoji.bind(self, e.id, true) })
              self.container.appendChild(self.reactions)
              self.container.appendChild(self.tron)
              this.core.el.appendChild(self.container)
            }
          }
        })

        this.playback = this.player.core.getCurrentContainer().playback
        this.player.on(Clappr.Events.PLAYER_ENDED, () => {
          this.showBlur = true
          this.logTime(null, this.duration)
          this.$emit('ended')
        })
        this.player.on(Clappr.Events.PLAYER_PLAY, () => {
          this.showBlur = false
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
        this.showBlur = true
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
        } else {
          this.wsRegisterEvents()
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
          const event = this.events[0]

          if (event.id !== this.$socket.id) {
            const playing = this.player.isPlaying()
            if (event.method === 'pause' && !playing) {
              return
            }

            this.lastEvent = event
            this.player[event.method](...event.args)
          } else {
            this.$socket.emit('player-event', event)
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
        this.$socket.emit('emoji', name)
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
            {value: `+=${Math.random() > 0.5 ? -15 : 15}`, easing: 'easeInOutSine'}
          ],
          easing: 'linear',
          duration: 1750,
          complete: () => {
            this.reactions.removeChild(el)
          }
        })
      },
      wsJoinRoom () {
        const time = parseInt(this.$route.query.wsTime, 10)
        const playing = this.$route.query.wsPlaying

        if (time > 0) {
          this.player.seek(time)
        }

        if (playing) {
          this.player.play()
        }

        this.$router.replace({path: this.$route.path, query: {roomId: this.room.replace('umi//', '')}})
        this.wsRegisterEvents()
      },
      wsRegisterEvents () {
        this.$socket.on('user-joined', this.wsOnJoined)
        this.$socket.on('player-event', this.wsOnEvent)
        this.$socket.on('emoji', this.displayEmoji)

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
        this.$socket.emit('update-status', {
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
        if (this.lastEvent) {
          this.lastEvent = null
          return
        }

        this.events.push({
          id: this.$socket.id, method, args
        })
      },
      wsDestroy () {
        this.$socket.off('user-joined', this.wsOnJoined)
        this.$socket.off('player-event', this.wsOnEvent)
        this.$socket.off('emoji', this.displayEmoji)

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
        this.$socket.emit('player-event', {
          id: this.$socket.id,
          method: 'pause',
          args: []
        })
      }
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

  .player-top-offset {
    top: 64px;
  }

  .player-width {
    width: 1024px;
  }

  .player-height {
    height: 576px;
  }

  #player > div[data-player] {
    margin: 0 auto;
  }

  .player-background {
    filter: blur(100px);
    position: relative;
    top: -300px;
    width: 100%;
  }
</style>

<style scoped>
  .controls {
    top: 584px;
    right: 5px;
  }
</style>
