<template>
  <div>
    <div v-if="media && media.name">
      <div v-if="internalSeek !== 0 && internalSeek !== media.duration" class="w-100 bg-washed-green pa2 cf absolute top-0 left-0 z-max">
        <div class="fl">
          <span class="b underline pointer" @click="playerSeek"><i class="fa fa-play-circle" aria-hidden="true"></i> Resume watching at {{prettyTime(internalSeek)}}?</span>
        </div>
        <div class="fr">
          <i class="fa fa-times pointer" aria-hidden="true" @click="internalSeek = 0"></i>
        </div>
      </div>
      <div v-if="nextEpisode && nextEpisodeId !== ''" class="bg-black-60 absolute absolute--fill z-max" style="height: 576px"></div>
      <div v-if="nextEpisode && nextEpisodeId !== ''" class="w-50 center bg-near-white pa2 pb0 cf mb3 absolute z-max left-0 right-0 shadow-1" style="top: 220px; height: 138px">
        <div class="fl">
          <strong class="mb2 db">Watch next episode:</strong>
          <media-item :seriesId="$route.params.seriesId" :id="nextEpisodeId" size="inline-small" :noBorder="true" @click="nextEpisode = false" />
        </div>
        <div class="fr">
          <i class="fa fa-times pointer" aria-hidden="true" @click="nextEpisode = false"></i>
        </div>
      </div>
      <umi-video v-if="streamData && streamData.format" :data="streamData" :poster="media.screenshot_image.full_url" :id="$route.params.id" :seek="seek" @play="internalSeek = 0" @ended="nextEpisode = true" />
      <div v-else class="w-100 bg-light-gray absolute top-0 left-0" style="padding-bottom: 576px"></div>
      <div class="cf media-info">
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
    <h2 class="tc" v-else>Loading video...</h2>
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
        nextEpisode: false,
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
      },
      nextEpisodeId () {
        if (this.seriesLoaded) {
          return Object.keys(this.$store.state.media).find((key) => {
            if (!this.media) return false
            const m = this.$store.state.media[key]
            return m.collection_id === this.media.collection_id && parseInt(m.episode_number, 10) === parseInt(this.media.episode_number, 10) + 1
          }) || ''
        } else {
          return ''
        }
      }
    },
    methods: {
      async getMediaInfo () {
        const {$store, $route} = this
        if (!$store.state.auth.username) return

        await $store.dispatch('getMediaInfo', $route.params.id)
        const res = await api({route: 'info', params: {session_id: $store.state.auth.session_id, media_id: $route.params.id, fields: 'media.stream_data'}})
        this.streamData = res.data.data.stream_data
        this.seek = 0
        this.internalSeek = this.media.playhead
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
    },
    beforeDestroy () {
      this.$store.commit('UPDATE_LIGHTS', false)
    }
  }
</script>

<style scoped>
  .media-info {
    padding-top: 595px;
  }
</style>
