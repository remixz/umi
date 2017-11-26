<template>
  <div class="pv2">
    <div id="player" class="bg-black w-100 absolute left-0 z-9999 player-top-offset" :class="{'shadow-2': lights}">
      <div v-if="playerInit && showBlur && !lights" class="w-100 player-height absolute top-0 left-0 overflow-hidden o-80">
        <img :src="poster" class="player-background" draggable="false">
      </div>
    </div>
    <div v-if="!playerInit" class="bg-black absolute w-100 left-0 player-height player-top-offset">
      <div class="bg-dark-gray center player-width player-height"></div>
    </div>
    <reactotron v-show="room !== ''" class="dib v-mid ml1 nowrap overflow-hidden reactotron relative z-9999" @emoji="handleEmoji" />
  </div>
</template>

<script>
  /* global Clappr, LevelSelector */
  import $script from 'scriptjs'
  import anime from 'animejs'
  import uuid from 'uuid/v4'
  import api, {LOCALE, VERSION} from 'lib/api'
  import emoji from 'lib/emoji'
  // import bif from 'lib/bif'
  import Reactotron from './Reactotron'

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
        return this.data.streams[0].url
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
      }
    },
    mounted () {
      // $script('//cdn.jsdelivr.net/g/clappr@0.2.65,clappr.level-selector@0.1.10,clappr.thumbnails-plugin@3.6.0', () => {
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
          // plugins: [LevelSelector, ClapprThumbnailsPlugin],
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
          // scrubThumbnails: {
          //   backdropHeight: null,
          //   spotlightHeight: 84,
          //   thumbs: []
          // },
          events: {
            onReady () {
              self.$emit('loaded')
              if (self.container) {
                return this.core.el.appendChild(self.container)
              }
              self.container = document.createElement('div')
              self.reactions = document.createElement('div')
              self.reactions.className = 'reaction-canvas absolute absolute--fill z-9999 tl'
              self.tron = self.$el.querySelector('.reactotron').cloneNode(true)
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

        if (this.bif) {
          // this.loadBif()
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
          this.$store.dispatch('updateRoomData', {
            playing: false,
            syncedTime: 0
          })
          this.playback.on(Clappr.Events.PLAYBACK_PLAY_INTENT, this.roomHandlePlay)
        }
        // this.loadBif()
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
        console.log('==== data ====')
        console.log(this.roomData)

        if (curr.playing !== prev.playing) {
          this.player[curr.playing ? 'play' : 'pause']()
        }

        if (curr.syncedTime !== prev.syncedTime) {
          this.player.seek(curr.syncedTime)
        }
      },
      connectedCount (curr, prev) {
        if (this.room !== '' && curr > prev) {
          this.$store.dispatch('updateRoomData', {
            syncedTime: Math.round(this.player.getCurrentTime()),
            playing: this.player.isPlaying()
          })
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
        emojiRef.set({
          name,
          eventId: uuid() // creates a unique event
        })
      },
      displayEmoji (snapshot) {
        if (!snapshot.exists() || !this.firstEmoji) return this.firstEmoji = true
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
      // async loadBif () {
      //   const thumbnailsPlugin = this.player.getPlugin('scrub-thumbnails')
      //   if (this.frames.length > 0) {
      //     thumbnailsPlugin.removeThumbnail(this.frames)
      //   }
      //   try {
      //     this.frames = await bif(this.bif)
      //     thumbnailsPlugin.addThumbnail(this.frames)
      //   } catch (err) {}
      // },
      wsJoinRoom () {
        const {syncedTime, playing} = this.roomData

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
        const emojiRef = this.$firebase.getRef(`roomEmoji/${this.room}`)
        emojiRef.on('value', this.displayEmoji)

        this.playback.on(Clappr.Events.PLAYBACK_PLAY_INTENT, this.roomHandlePlay)
        this.player.on(Clappr.Events.PLAYER_PAUSE, this.roomHandlePause)
        this.player.on(Clappr.Events.PLAYER_SEEK, this.roomHandleSeek)
        this.player.on(Clappr.Events.PLAYER_FULLSCREEN, this.handleFullscreen)
        this.player.core.mediaControl.on(Clappr.Events.MEDIACONTROL_SHOW, this.handleShowControls)
        this.player.core.mediaControl.on(Clappr.Events.MEDIACONTROL_HIDE, this.handleHideControls)
      },
      roomHandlePause () {
        this.$store.dispatch('updateRoomData', {
          playing: false,
          syncedTime: Math.round(this.player.getCurrentTime())
        })
      },
      roomHandlePlay () {
        this.$store.dispatch('updateRoomData', {
          playing: true
        })
      },
      roomHandleSeek (time) {
        this.$store.dispatch('updateRoomData', {
          syncedTime: Math.round(time)
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
</style>
