<template>
  <div>
    <div v-if="expired" class="w-80 bg-washed-red pa2 mv3 center">
      <strong>This room has expired. <router-link to="/">Return to your queue?</router-link></strong>
    </div>
    <h2 class="tc" v-else>Joining room...</h2>
  </div>
</template>

<script>
  import WS from 'lib/websocket'

  export default {
    name: 'room',
    data () {
      return {
        expired: false
      }
    },
    mounted () {
      const room = this.$route.params.id
      this.$store.dispatch('joinRoom', room)
      this.timeout = setTimeout(() => {
        this.expired = true
        this.$store.dispatch('leaveRoom')
      }, 5000)
      WS.socket.once('update-status', (obj) => {
        clearTimeout(this.timeout)
        this.$store.commit('UPDATE_CONNECTED', true)
        if (obj.noPlayer) {
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
    }
  }
</script>
