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
    async created () {
      const room = this.$route.params.id
      const {route} = await this.$store.dispatch('enterRoom', {id: room})

      if (route.name !== 'media') {
        this.$router.replace('/')
      } else {
        this.$router.replace({
          path: route.path,
          query: {
            joinRoom: true
          }
        })
      }
    },
    destroyed () {
      if (!this.$store.state.roomConnected) {
        clearTimeout(this.timeout)
        this.$store.dispatch('leaveRoom')
      }
    }
  }
</script>
