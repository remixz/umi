<template>
  <div>
    <div v-if="media && media.name">
      <h1>{{media.episode_number}}: {{media.name}}</h1>
      <umi-video v-if="streamData && streamData.format" :data="streamData" :poster="media.screenshot_image.full_url" />
      <p>{{media.description}}</p>
    </div>
    <h2 v-else>loading</h2>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import api from 'lib/api'
  import Video from 'components/Video'

  export default {
    name: 'series',
    mixins: [authCheck],
    components: {
      'umi-video': Video
    },
    data () {
      return {
        streamData: {}
      }
    },
    computed: {
      media () {
        const {$store, $route} = this
        return $store.state.media[$route.params.id]
      }
    },
    async beforeMount () {
      const {$store, $route} = this
      if (!$store.state.auth.username) return

      await $store.dispatch('getMediaInfo', $route.params.id)
      const res = await api({route: 'info', params: {session_id: $store.state.auth.session_id, media_id: $route.params.id, fields: 'media.stream_data,media.playhead'}})
      this.streamData = res.data.data.stream_data
    }
  }
</script>
