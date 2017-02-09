<template>
  <div></div>
</template>

<script>
  /* global Clappr, LevelSelector */
  export default {
    name: 'video',
    props: ['data', 'poster'],
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
    }
  }
</script>
