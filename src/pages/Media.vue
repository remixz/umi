<template>
  <div>
    <div v-if="media && media.name">
      <div v-if="internalSeek !== 0 && internalSeek !== duration" class="w-100 bg-washed-green pa2 mv3 cf">
        <div class="fl">
          <span class="b underline pointer" @click="playerSeek">Resume watching ({{prettyTime(internalSeek)}})</span>
        </div>
        <div class="fr">
          <i class="fa fa-times pointer" aria-hidden="true" @click="internalSeek = 0"></i>
        </div>
      </div>
      <umi-video v-if="streamData && streamData.format" :data="streamData" :poster="media.screenshot_image.full_url" :id="$route.params.id" :seek="seek" />
      <div v-else class="w-100" style="padding-bottom: 62.5%"></div>
      <div class="cf">
        <div class="fl w-80 pr2">
          <h2>Episode {{media.episode_number}}: {{media.name}}</h2>
          <p>{{media.description}}</p>

          <h2>Episodes</h2>
          <episode-scroller v-if="collectionMedia && collectionMedia.length > 0" :ids="collectionMedia" :selected="$route.params.id" />
        </div>
        <div class="fl w-20">
          <div class="fr">
            <h2>Series</h2>
            <series-item v-if="seriesLoaded" :id="media.series_id" noMargin="true" />
          </div>
        </div>
      </div>
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
  import SeriesItem from 'components/SeriesItem'
  import EpisodeScroller from 'components/EpisodeScroller'
  import WS from 'lib/websocket'

  export default {
    name: 'series',
    mixins: [authCheck],
    metaInfo () {
      return {
        title: this.series ? `Episode ${this.media.episode_number}: ${this.media.name} — ${this.series.name}` : 'Loading...'
      }
    },
    components: {
      'umi-video': Video,
      'media-item': MediaItem,
      'series-item': SeriesItem,
      'episode-scroller': EpisodeScroller
    },
    data () {
      return {
        streamData: {},
        internalSeek: 0,
        seek: 0,
        nextEpisodeId: '',
        duration: 0,
        seriesLoaded: false
      }
    },
    computed: {
      media () {
        const {$store, $route} = this
        return $store.state.media[$route.params.id]
      },
      mediaId () {
        return this.$route.params.id
      },
      collectionMedia () {
        const {$store} = this
        return this.media ? $store.state.collectionMedia[this.media.collection_id] : []
      },
      room () {
        return this.$store.state.roomId
      },
      series () {
        return this.media ? this.$store.state.series[this.media.series_id] : null
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
        await $store.dispatch('getSeriesInfo', this.media.series_id)
        this.seriesLoaded = true
      },
      prettyTime (time) {
        return prettyTime(time)
      },
      playerSeek () {
        this.seek = this.internalSeek
        this.internalSeek = 0
      }
    },
    watch: {
      mediaId (id) {
        this.getMediaInfo()
        if (this.room !== '') {
          WS.socket.emit('change', this.$route.path)
        }
      }
    },
    beforeMount () {
      this.getMediaInfo()
      if (this.room !== '') {
        WS.socket.emit('change', this.$route.path)
      }
    }
  }
</script>
