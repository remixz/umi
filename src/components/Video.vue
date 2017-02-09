<template>
  <div></div>
</template>

<script>
  /* global Clappr, LevelSelector */
  import api, {LOCALE, VERSION} from 'lib/api'

  export default {
    name: 'video',
    props: ['data', 'poster', 'id', 'seek'],
    computed: {
      streamUrl () {
        return this.data.streams[0].url
      }
    },
    mounted () {
      this.player = new Clappr.Player({
        source: this.streamUrl,
        poster: this.poster,
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
        }
      })

      this.player.attachTo(this.$el)
      this.player.on(Clappr.Events.PLAYER_ENDED, this.logTime)
      if (this.seek && this.seek !== 0) {
        this.player.seek(this.seek)
      }
    },
    watch: {
      data () {
        this.player.configure({
          source: this.streamUrl,
          poster: this.poster
        })
      },
      id (_, old) {
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
      logTime (id) {
        const time = Math.round(this.player.getCurrentTime());
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
      }
    },
    beforeDestroy () {
      this.logTime()
      this.player.destroy()
    }
  }
</script>
