<template>
  <div>
    <div v-if="media && media.name">
      <div v-if="internalSeek !== 0 && internalSeek < media.duration" class="bg-washed-green pa2 cf absolute left-0 right-0 center player-width" style="z-index: 10000; top: 606px;">
        <div class="fl">
          <span @click="playerSeek"> <i class="fa fa-play-circle" aria-hidden="true"></i> <span class="fw6 underline pointer">Resume watching at {{prettyTime(internalSeek)}}?</span></span>
        </div>
        <div class="fr">
          <i class="fa fa-times pointer grow" aria-hidden="true" @click="internalSeek = 0"></i>
        </div>
      </div>
      <div v-if="nextEpisode && nextEpisodeId !== ''" class="bg-black-60 absolute absolute--fill z-max player-height player-top-offset"></div>
      <div v-if="nextEpisode && nextEpisodeId !== ''" class="w-50 center bg-near-white pa2 pb0 cf mb3 absolute z-max left-0 right-0 shadow-1" style="top: 284px; height: 138px">
        <div class="fl">
          <strong class="mb2 db">Watch next episode:</strong>
          <media-item :seriesId="$route.params.seriesId" :id="nextEpisodeId" size="inline-small" :noBorder="true" @click="nextEpisode = false" />
        </div>
        <div class="fr">
          <i class="fa fa-times pointer" aria-hidden="true" @click="nextEpisode = false"></i>
        </div>
      </div>
      <umi-video v-if="streamData && streamData.format" :duration="media.duration" :data="streamData" :poster="media.screenshot_image.full_url" :id="$route.params.id" :bif="media.bif_url" :seek="seek" @play="playerPlay" @ended="playerEnded" />
      <div v-else class="pv2">
        <div class="bg-black absolute w-100 left-0 player-height player-top-offset">
          <div class="bg-dark-gray center player-width player-height"></div>
        </div>
        <reactotron v-if="room !== ''" class="dib v-mid ml1 nowrap overflow-hidden reactotron relative z-9999" style="top: 565px;" />
      </div>
      <div class="media-info">
        <div class="w-100">
          <h2 class="normal lh-title mb2 w-80 dib"><span class="small-caps fw6">Episode {{media.episode_number}}:</span> {{media.name}}</h2>
          <div class="dib fr pt3 z-9999 relative">
            <div v-tooltip.bottom-center="'Watch with others'" :class="`f5 fw6 dib ba ${lights ? 'white b--white-60 hover-bg-transparent' : 'black b--black-20 hover-bg-light-gray bg-animate'} bg-transparent br2 black pointer ph3 pv2`" v-if="room === ''" @click="$store.dispatch('createRoom')"><i class="tc fa fa-users" aria-hidden="true"></i></div>
            <div v-tooltip.bottom-center="'Toggle dark mode'" :class="`f5 fw6 dib ba ${lights ? 'white b--white-60 hover-bg-transparent' : 'black b--black-20 hover-bg-light-gray bg-animate'} bg-transparent br2 black pointer ph3 pv2`" @click="$store.commit('UPDATE_LIGHTS', !lights)"><i class="tc fa fa-moon-o" aria-hidden="true" style="width: 16px;"></i></div>
          </div>
        </div>
        <div style="height: 21px;">
          <router-link class="dark-gray fw6 no-underline bb pb1 b--dark-gray hover-blue link" :to="`/series/${media.series_id}`">{{collectionLoaded ? collection.name : 'Loading...'}}</router-link>
          <a v-if="isMalAuthed && malItem.id" :href="malItem.url" target="_blank" rel="noopener"><span :class="`mal-icon ${malSynced ? 'watched' : ''} ml1`"></span></a>
        </div>
        <p class="lh-copy">{{media.description}}</p>

        <h3 class="fw5">Episodes</h3>
        <episode-scroller v-if="collectionMedia && collectionMedia.length > 0" :ids="collectionMedia" :selected="$route.params.id" />
      </div>
    </div>
    <div v-else>
      <div class="pv2">
        <div class="bg-black absolute w-100 left-0 player-height player-top-offset">
          <div class="bg-dark-gray center player-width player-height"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import api, { UMI_SERVER } from 'lib/api'
  import prettyTime from 'lib/prettyTime'
  import Video from 'components/Video'
  import MediaItem from 'components/MediaItem'
  import EpisodeScroller from 'components/EpisodeScroller'
  import Reactotron from 'components/Reactotron'

  export default {
    name: 'media',
    metaInfo () {
      return {
        title: this.collection ? `Episode ${this.media.episode_number}: ${this.media.name} — ${this.collection.name}` : 'Loading...'
      }
    },
    components: {
      'umi-video': Video,
      'media-item': MediaItem,
      'episode-scroller': EpisodeScroller,
      'reactotron': Reactotron
    },
    data () {
      return {
        streamData: {},
        internalSeek: 0,
        seek: 0,
        nextEpisode: false,
        collectionLoaded: false,
        malItem: {},
        malSynced: false,
        timeout: 0
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
      },
      lights () {
        return this.$store.state.lights
      },
      malAuth () {
        return this.$store.state.malAuth
      },
      isMalAuthed () {
        return !!this.$store.state.malAuth.username
      }
    },
    methods: {
      async getMediaInfo () {
        const {$store, $route} = this

        await $store.dispatch('getMediaInfo', $route.params.id)
        api({route: 'info', params: {session_id: $store.state.auth.session_id, media_id: $route.params.id, fields: 'media.stream_data'}})
          .then((res) => {
            this.streamData = res.data.data.stream_data
            this.seek = 0
            this.internalSeek = this.media.playhead
          })
        await $store.dispatch('getCollectionInfo', this.media.collection_id)
        this.collectionLoaded = true
        $store.dispatch('getMediaForCollection', this.media.collection_id)
        if (this.isMalAuthed) {
          const {data: {status, item}} = await axios.get(`${UMI_SERVER}/mal/series?name=${this.collection.name}`)
          if (status === 'ok') {
            this.malItem = item
          }
        }
      },
      prettyTime (time) {
        return prettyTime(time)
      },
      playerPlay () {
        this.internalSeek = 0
        if (this.malItem.id) {
          this.timeout = setTimeout(async () => {
            try {
              const episode = this.collectionMedia.indexOf(this.media.media_id.toString()) + 1
              const status = (episode === this.collectionMedia.length && this.malItem.payload.status !== 'Finished Airing') ? 'completed' : 'watching'
              await axios.post(`${UMI_SERVER}/mal/update`, {
                username: this.malAuth.username,
                password: this.malAuth.password,
                id: this.malItem.id,
                episode,
                status
              })
              this.malSynced = true
            } catch (err) {
              this.malSynced = false
            }
          }, 1000 * 60 * 2) // 1000 * 60 * 2 = 2 minutes
        }
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
        this.malSynced = false
        this.getMediaInfo()
        if (this.room !== '') {
          this.$socket.emit('change', this.$route.path)
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
        this.$socket.emit('change', this.$route.path)
        this.$router.replace({path: this.$route.path, query: Object.assign({}, this.$route.query, {roomId: this.room.replace('umi//', '')})})
      }
    },
    beforeDestroy () {
      this.$store.commit('UPDATE_LIGHTS', false)
    }
  }
</script>

<style scoped>
  .media-info {
    padding-top: 540px;
  }
</style>
