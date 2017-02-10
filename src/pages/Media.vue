<template>
  <div>
    <div v-if="media && media.name">
      <umi-video v-if="streamData && streamData.format" :data="streamData" :poster="media.screenshot_image.full_url" :id="$route.params.id" :seek="seek" />
      <h1>Episode {{media.episode_number}}: {{media.name}}</h1>
      <button v-if="internalSeek !== 0 && internalSeek !== duration" @click="playerSeek">Go to {{prettyTime(internalSeek)}}</button>
      <p>{{media.description}}</p>
      <media-item v-if="nextEpisodeId !== ''" :id="nextEpisodeId" :seriesId="$route.params.seriesId" />
    </div>
    <h2 v-else>loading</h2>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import api from 'lib/api'
  import prettyTime from 'lib/prettyTime'
  import Video from 'components/Video'
  import MediaItem from 'components/MediaItem'
  import WS from 'lib/websocket'

  export default {
    name: 'series',
    mixins: [authCheck],
    components: {
      'umi-video': Video,
      'media-item': MediaItem
    },
    data () {
      return {
        streamData: {},
        internalSeek: 0,
        seek: 0,
        nextEpisodeId: '',
        duration: 0
      }
    },
    computed: {
      media () {
        const {$store, $route} = this
        return $store.state.media[$route.params.id]
      },
      mediaId () {
        return this.$route.params.id
      }
    },
    methods: {
      async getMediaInfo () {
        const {$store, $route} = this
        if (!$store.state.auth.username) return

        await $store.dispatch('getMediaInfo', $route.params.id)
        const res = await api({route: 'info', params: {session_id: $store.state.auth.session_id, media_id: $route.params.id, fields: 'media.stream_data,media.playhead,media.duration'}})
        this.streamData = res.data.data.stream_data
        this.seek = 0
        this.internalSeek = res.data.data.playhead
        this.duration = res.data.data.duration
        await $store.dispatch('getMediaForCollection', this.media.collection_id)
        this.nextEpisodeId = Object.keys($store.state.media).find((key) => {
          const m = $store.state.media[key]
          return m.collection_id === this.media.collection_id && parseInt(m.episode_number, 10) === parseInt(this.media.episode_number, 10) + 1
        }) || ''
      },
      prettyTime (time) {
        return prettyTime(time)
      },
      playerSeek () {
        this.seek = this.internalSeek
        this.internalSeek = 0
      },
      wsOnChange (mediaId) {
        if (WS.room !== '' && mediaId !== this.$route.params.id) {
          this.$router.push(`/series/${this.$route.params.seriesId}/${mediaId}`)
        }
      }
    },
    watch: {
      mediaId (id) {
        this.getMediaInfo()
        if (WS.room !== '') {
          WS.socket.emit('change', id)
        }
      }
    },
    beforeMount () {
      this.getMediaInfo()
      WS.socket.on('change', this.wsOnChange)
    },
    beforeDestroy () {
      WS.socket.off('change', this.wsOnChange)
    }
  }
</script>
