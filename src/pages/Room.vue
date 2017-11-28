<template>
  <div>
    <h1 class="tc fw6">Joining room...</h1>
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
    }
  }
</script>
