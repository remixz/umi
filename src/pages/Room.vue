<template>
  <div>
    <div v-if="expired" class="w-80 bg-washed-red pa2 mv3 center">
      <strong>This room has expired. <router-link to="/">Return to your dashboard?</router-link></strong>
    </div>
    <h2 class="tc" v-else>Joining room...</h2>
  </div>
</template>

<script>
  export default {
    name: 'room',
    metaInfo: {
      title: 'Room'
    },
    data () {
      return {
        expired: false
      }
    },
    created () {
      const room = this.$route.params.id
      this.$store.dispatch('joinRoom', room)
      this.timeout = setTimeout(() => {
        this.expired = true
        this.$store.dispatch('leaveRoom')
      }, 5000)
      this.$socket.once('update-status', (obj) => {
        clearTimeout(this.timeout)
        this.$store.commit('UPDATE_CONNECTED', true)
        if (obj.name !== 'media') {
          this.$router.replace('/')
        } else {
          this.$router.replace({
            path: obj.path,
            query: {
              joinRoom: true,
              wsPlaying: obj.playing,
              wsTime: obj.time
            }
          })
        }
      })
    },
    destroyed () {
      if (!this.$store.state.roomConnected) {
        clearTimeout(this.timeout)
        this.$store.dispatch('leaveRoom')
      }
    }
  }
</script>
