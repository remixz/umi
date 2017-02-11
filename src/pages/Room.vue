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
  import {authCheck} from 'lib/auth'

  export default {
    name: 'room',
    mixins: [authCheck],
    metaInfo: {
      title: 'Room'
    },
    data () {
      return {
        expired: false
      }
    },
    mounted () {
      if (!this.$store.state.auth.username) return

      const room = this.$route.params.id
      this.$store.dispatch('joinRoom', room)
      this.timeout = setTimeout(() => {
        this.expired = true
        this.$store.dispatch('leaveRoom')
      }, 5000)
      WS.socket.once('update-status', (obj) => {
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
    }
  }
</script>
