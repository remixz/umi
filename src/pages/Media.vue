<template>
  <div>
    <div v-if="media && media.name">
      <div v-if="internalSeek !== 0 && internalSeek !== media.duration" class="w-100 bg-washed-green pa2 cf absolute top-0 left-0 z-max">
        <div class="fl">
          <span @click="playerSeek"> <i class="fa fa-play-circle" aria-hidden="true"></i> <span class="fw6 underline pointer">Resume watching at {{prettyTime(internalSeek)}}?</span></span>
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
      <umi-video v-if="streamData && streamData.format" :data="streamData" :poster="media.screenshot_image.full_url" :id="$route.params.id" :seek="seek" @play="internalSeek = 0" @ended="playerEnded" />
      <div v-else class="pv2">
        <div class="w-100 bg-light-gray absolute top-0 left-0" style="padding-bottom: 576px"></div>
        <div class="absolute z-9999" style="top: 588px">
          <div class="f5 fw6 dib ba black b--black-20 bg-transparent br2 black pointer ph3 pv2"><i class="fa fa-lightbulb-o" aria-hidden="true"></i> Toggle lights</div>
          <div class="f5 fw6 dib ba black b--black-20 bg-transparent br2 black pointer ph3 pv2" v-if="room === ''"><i class="fa fa-globe" aria-hidden="true"></i> Watch with others</div>
          <reactotron v-if="room !== ''" class="dib v-mid ml1 nowrap overflow-hidden reactotron" />
        </div>
      </div>
      <div class="media-info">
        <h2 class="normal lh-title mb2"><span class="small-caps fw6">Episode {{media.episode_number}}:</span> {{media.name}}</h2>
        <router-link class="dark-gray fw6 no-underline bb pb1 b--dark-gray" :to="`/series/${media.series_id}`">{{collectionLoaded ? collection.name : 'Loading...'}}</router-link>
        <p class="lh-copy">{{media.description}}</p>

        <h3 class="fw5">Episodes</h3>
        <episode-scroller v-if="collectionMedia && collectionMedia.length > 0" :ids="collectionMedia" :selected="$route.params.id" />
      </div>
    </div>
    <h2 class="tc" v-else>Loading video...</h2>
  </div>
</template>

<script>
  import api from 'lib/api'
  import prettyTime from 'lib/prettyTime'
  import Video from 'components/Video'
  import MediaItem from 'components/MediaItem'
  import SeriesItem from 'components/SeriesItem'
  import EpisodeScroller from 'components/EpisodeScroller'
  import Reactotron from 'components/Reactotron'
  import WS from 'lib/websocket'

  export default {
    name: 'series',
    metaInfo () {
      return {
        title: this.collection ? `Episode ${this.media.episode_number}: ${this.media.name} — ${this.collection.name}` : 'Loading...'
      }
    },
    components: {
      'umi-video': Video,
      'media-item': MediaItem,
      'series-item': SeriesItem,
      'episode-scroller': EpisodeScroller,
      'reactotron': Reactotron
    },
    data () {
      return {
        streamData: {},
        internalSeek: 0,
        seek: 0,
        nextEpisode: false,
        collectionLoaded: false
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
      collection () {
        return this.media ? this.$store.state.collections[this.media.collection_id] : null
      },
      nextEpisodeId () {
        if (this.collectionLoaded) {
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
        api({route: 'info', params: {session_id: $store.state.auth.session_id, media_id: $route.params.id, fields: 'media.stream_data'}})
          .then((res) => {
            this.streamData = res.data.data.stream_data
            this.seek = 0
            this.internalSeek = this.media.playhead
          })
        await $store.dispatch('getCollectionInfo', this.media.collection_id)
        this.collectionLoaded = true
        await $store.dispatch('getMediaForCollection', this.media.collection_id)
      },
      prettyTime (time) {
        return prettyTime(time)
      },
      playerSeek () {
        this.seek = this.internalSeek
        this.internalSeek = 0
      },
      playerEnded () {
        this.nextEpisode = true
        const newMedia = Object.assign({}, this.media, {playhead: this.media.duration})
        this.$store.commit('ADD_MEDIA', newMedia)
      }
    },
    watch: {
      mediaId (id) {
        this.nextEpisode = false
        this.getMediaInfo()
        if (this.room !== '') {
          WS.socket.emit('change', this.$route.path)
          this.$router.replace({path: this.$route.path, query: Object.assign({}, this.$route.query, {roomId: this.room.replace('umi//', '')})})
        }
      },
      room (id) {
        if (id) {
          const newRoute = Object.assign({}, this.$route, {query: {roomId: id.replace('umi//', '')}})
          this.$router.replace(newRoute)
        } else {
          const newRoute = Object.assign({}, this.$route, {query: {}})
          this.$router.replace(newRoute)
        }
      }
    },
    beforeMount () {
      if (this.$route.query.roomId && !this.room) return this.$router.replace(`/room/${this.$route.query.roomId}`)

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
