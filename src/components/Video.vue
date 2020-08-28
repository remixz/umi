<template>
  <div class="pv2">
    <div id="player" class="bg-black w-100 absolute left-0 z-9999 player-top-offset" :class="{'shadow-2': lights}">
      <div v-if="playerInit && showBlur && !lights" class="w-100 player-height absolute top-0 left-0 overflow-hidden o-80">
        <img :src="poster | cdnRewrite" class="player-background" draggable="false">
      </div>
    </div>
    <div v-if="!playerInit" class="bg-black absolute w-100 left-0 player-height player-top-offset">
      <div class="bg-dark-gray center player-width player-height"></div>
    </div>
    <reactotron v-show="room !== ''" class="dib v-mid ml1 nowrap overflow-hidden reactotron relative z-9999" :class="{disabled: !roomConnected}" @emoji="handleEmoji" />
  </div>
</template>

<script>
  import Clappr from 'clappr'
  import LevelSelector from 'lib/clappr-level-selector'
  import Thumbnails from 'clappr-thumbnails-plugin'
  import anime from 'animejs'
  import uuid from 'uuid/v4'
  import api, {LOCALE, VERSION} from 'lib/api'
  import emoji from 'lib/emoji'
  import bifWorker from 'workerize-loader!lib/bif'
  import Reactotron from './Reactotron'

  const bif = bifWorker()

  export default {
    name: 'video',
    props: ['data', 'poster', 'bif', 'id', 'seek', 'duration'],
    components: {Reactotron},
    data () {
      return {
        playerInit: false,
        showBlur: true,
        firstEmoji: false,
        frames: []
      }
    },
    computed: {
      streamUrl () {
        const url = this.data.streams[0].url
        if (url && url.includes('pl.crunchyroll.com')) {
          return this.data.streams[0].url.replace('https://pl.crunchyroll.com', '/pl-proxy')
        } else {
          return this.data.streams[0].url
        }
      },
      room () {
        return this.$store.state.roomId
      },
      lights () {
        return this.$store.state.lights
      },
      roomData () {
        return this.$store.state.roomData
      },
      connectedCount () {
        return this.$store.state.connectedCount
      },
      roomConnected () {
        return this.$store.state.roomConnected
      },
      roomHostOnly () {
        return this.roomData.hostOnly
      }
    },
    mounted () {
      const self = this
      this.playerInit = true
      this.player = new Clappr.Player({
        parent: this.$el.querySelector('#player'),
        width: '1024px',
        height: '576px',
        source: this.streamUrl,
        poster: this.poster,
        disableVideoTagContextMenu: true,
        plugins: [LevelSelector, Thumbnails],
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
        scrubThumbnails: {
          backdropHeight: null,
          spotlightHeight: 84,
          thumbs: []
        },
        events: {
          onReady () {
            if (self.container) {
              return this.core.el.appendChild(self.container)
            }
            self.container = document.createElement('div')
            self.reactions = document.createElement('div')
            self.reactions.className = 'reaction-canvas absolute absolute--fill z-9999 tl'
            self.tron = self.$el.querySelector('.reactotron').cloneNode(true)
            self.tron.className = `${self.tron.className.replace('disabled', '')} z-max player-tron`
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

        if (this.$store.state.roomConnected && !this.$store.getters.isRoomHost) {
          this.player.configure({
            chromeless: this.roomHostOnly,
            allowUserInteraction: !this.roomHostOnly
          })

          this.updatePlayerElements()
        }
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

      if (this.bif) {
        this.loadBif()
      }
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
          this.$store.dispatch('updateRoomData', {
            playing: false,
            syncedTime: 0
          })
          this.playback.on(Clappr.Events.PLAYBACK_PLAY_INTENT, this.roomHandlePlay)
        }
        this.loadBif()
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
      roomData (curr, prev) {
        if (curr.playing !== prev.playing && curr.playing !== this.player.isPlaying()) {
          this.player[curr.playing ? 'play' : 'pause']()
        }

        if (curr.syncedTime !== prev.syncedTime && curr.syncedTime !== this.player.getCurrentTime()) {
          this.player.seek(curr.syncedTime)
        }
      },
      connectedCount (curr, prev) {
        if (this.room !== '' && curr > prev) {
          this.$store.dispatch('updateRoomData', {
            syncedTime: this.player.getCurrentTime(),
            playing: this.player.isPlaying()
          })
        }
      },
      roomHostOnly (curr) {
        if (this.$store.getters.isRoomHost) return

        this.player.configure({
          chromeless: curr,
          allowUserInteraction: !curr
        })

        this.updatePlayerElements()
      }
    },
    methods: {
      handleInputClick ({target}) {
        target.select()
      },
      logTime (id, t) {
        const time = t || this.player.getCurrentTime()
        if (time !== 0 && process.env.NODE_ENV === 'production') {
          const data = new FormData()
          data.append('session_id', this.$store.state.auth.session_id)
          data.append('event', 'playback_status')
          data.append('playhead', time)
          data.append('media_id', id || this.id)
          data.append('locale', LOCALE())
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

        const emojiRef = this.$firebase.getRef(`roomEmoji/${this.room}`)
        emojiRef.transaction(() => {
          return {
            name,
            eventId: uuid() // creates a unique event
          }
        })
      },
      displayEmoji (snapshot) {
        if (!snapshot.exists() || !this.firstEmoji) {
          this.firstEmoji = true
          return
        }
        const {name} = snapshot.val()
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
      async loadBif () {
        const thumbnailsPlugin = this.player.getPlugin('scrub-thumbnails')
        if (this.frames.length > 0) {
          thumbnailsPlugin.removeThumbnail(this.frames)
        }

        this.frames = await bif.parse(this.bif)
        if (this.frames.length > 0) {
          thumbnailsPlugin.addThumbnail(this.frames)
        }
      },
      wsJoinRoom () {
        const {syncedTime, playing} = this.roomData

        if (!this.$store.getters.isRoomHost) {
          this.player.configure({
            chromeless: this.roomHostOnly,
            allowUserInteraction: !this.roomHostOnly
          })
        }

        if (syncedTime > 0) {
          this.player.seek(syncedTime)
        }

        if (playing) {
          this.player.play()
        }

        this.$router.replace({path: this.$route.path, query: {roomId: this.room}})
        this.wsRegisterEvents()
      },
      async wsRegisterEvents () {
        this.playback.on(Clappr.Events.PLAYBACK_PLAY_INTENT, this.roomHandlePlay)
        this.player.on(Clappr.Events.PLAYER_PAUSE, this.roomHandlePause)
        this.player.on(Clappr.Events.PLAYER_SEEK, this.roomHandleSeek)
        this.player.on(Clappr.Events.PLAYER_FULLSCREEN, this.handleFullscreen)
        this.player.core.mediaControl.on(Clappr.Events.MEDIACONTROL_SHOW, this.handleShowControls)
        this.player.core.mediaControl.on(Clappr.Events.MEDIACONTROL_HIDE, this.handleHideControls)

        await this.$firebase.init()
        const emojiRef = this.$firebase.getRef(`roomEmoji/${this.room}`)
        emojiRef.on('value', this.displayEmoji)
      },
      roomHandlePause () {
        this.$store.dispatch('updateRoomData', {
          playing: false,
          syncedTime: this.player.getCurrentTime()
        })
      },
      roomHandlePlay () {
        this.$store.dispatch('updateRoomData', {
          playing: true
        })
      },
      roomHandleSeek (time) {
        if (time === this.roomData.syncedTime) return
        this.$store.dispatch('updateRoomData', {
          syncedTime: time
        })
      },
      wsDestroy () {
        const emojiRef = this.$firebase.getRef(`roomEmoji/${this.room}`)
        emojiRef.off('value', this.displayEmoji)
        this.playback.off(Clappr.Events.PLAYBACK_PLAY_INTENT, this.roomHandlePlay)
        this.player.off(Clappr.Events.PLAYER_PAUSE, this.roomHandlePause)
        this.player.off(Clappr.Events.PLAYER_SEEK, this.roomHandleSeek)
        this.player.off(Clappr.Events.PLAYER_FULLSCREEN, this.handleFullscreen)
        this.player.core.mediaControl.off(Clappr.Events.MEDIACONTROL_SHOW, this.handleShowControls)
        this.player.core.mediaControl.off(Clappr.Events.MEDIACONTROL_HIDE, this.handleHideControls)
      },
      updatePlayerElements () {
        if (this.showBlur) return
        const method = this.roomHostOnly ? 'hide' : 'show'

        this.player.core.mediaControl.enable()
        this.player.core.mediaControl.$playPauseToggle[method]()
        this.player.core.mediaControl.$seekBarContainer[method]()
      }
    },
    beforeDestroy () {
      this.logTime()
      this.player.destroy()
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
    top: 0 !important;
  }
  .player-tron.show {
    transform: translateY(0);
  }

  #player > div[data-player] {
    margin: 0 auto;
  }
</style>

<style scoped>
  .controls {
    top: 584px;
    right: 5px;
  }

  .player-background {
    filter: blur(100px);
    position: relative;
    top: -300px;
    width: 100%;
  }

  .reactotron {
    top: 565px;
  }

  .reactotron.disabled {
    pointer-events: none;
    filter: blur(2px);
  }
</style>
