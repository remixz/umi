<template>
  <div>
    <div class="absolute w-100 bg-dark-gray top-0 left-0 header-bg"></div>
    <div v-if="media && media.created">
      <div v-if="loading" class="bg-black-60 absolute absolute--fill z-max player-height player-top-offset tc">
        <i class="fa fa-circle-o-notch fa-spin fa-3x white center loading-spinner"></i>
      </div>
      <div v-if="shouldContinueWatching && !loading" @click="continueWatching" class="absolute z-max player-width player-top-offset left-0 right-0 center cf white">
        <div class="fw5 f4 pa3 w-100 bg-black-60 hover-bg-black-70 bg-animate pointer absolute resume-container">
          <i class="fa fa-fast-forward mr2" aria-hidden="true"></i> Resume watching at {{prettyTime}}
        </div>
      </div>
      <div v-if="shouldNextEpisode" class="absolute z-max player-width player-top-offset left-0 right-0 center cf white">
        <router-link class="white" :to="`/series/${nextEpisodeMedia.series_id}/${nextEpisodeMedia.media_id}`">
          <div class="fw5 f4 pa3 w-100 bg-black-60 hover-bg-black-70 bg-animate pointer absolute hide-child next-container">
            <div class="child absolute bg-black-40 tc next-episode-overlay">
              <i class="fa fa-play white tc play-icon" aria-hidden="true"></i>
            </div>
            <img :src="nextEpisodeMedia.screenshot_image.thumb_url | cdnRewrite" class="v-mid bg-dark-gray next-episode-image">
            <div class="dib v-mid ml2">
              Watch next episode: <br /> Episode {{nextEpisodeMedia.episode_number}} &mdash; {{nextEpisodeMedia.name}}
            </div>
          </div>
        </router-link>
      </div>
      <umi-video v-if="streamData && streamData.format" :duration="media.duration" :data="streamData" :poster="poster" :id="$route.params.id" :bif="media.bif_url" :seek="seek" @play="playerPlay" @ended="playerEnded" />
      <div v-else class="pv2">
        <div class="bg-black absolute w-100 left-0 player-height player-top-offset">
          <div class="bg-dark-gray center player-width player-height"></div>
        </div>
        <reactotron v-if="room !== ''" class="dib v-mid ml1 nowrap overflow-hidden reactotron relative z-9999"/>
      </div>
      <div class="media-info">
        <div>
          <h2 class="normal lh-title mb2 w-80 dib">{{media.name}}</h2>
          <div class="dib fr mt3 z-9999 relative box-shadow-umi br2 ba b--black-20">
            <div v-tooltip.bottom-center="'Watch with others'" class="f8 fw6 dib bg-transparent black pointer ph3 pv2 br b--black-20" :class="optionClasses" v-if="room === ''" @click="createRoom">
              <i class="tc fa fa-users w-1" aria-hidden="true"></i>
            </div><div v-tooltip.bottom-center="'Toggle dark mode'" class="f8 fw6 dib bg-transparent black pointer ph3 pv2" :class="optionClasses" @click="$store.commit('UPDATE_LIGHTS', !lights)">
              <i class="tc fa fa-moon-o w-1" aria-hidden="true"></i>
            </div>
          </div>
        </div>
        <div class="fw6">
          <router-link class="dark-gray no-underline bb pb1 b--dark-gray hover-blue link" :to="`/series/${media.series_id}`">
            {{media.collection_name}}
          </router-link>
          &bull; Episode {{media.episode_number}}
          &bull; <i class="fa fa-clock-o" aria-hidden="true"></i> {{duration}}
        </div>
        <a v-if="isMalAuthed && malItem.id" :href="malItem.url" target="_blank" rel="noopener"><span class="mal-icon ml1" :class="{watched: malSynced}"></span></a>
        <p class="lh-copy">{{media.description}}</p>
        <h3 class="fw5">Episodes</h3>
        <episode-scroller v-if="collectionMedia && collectionMedia.length > 0" :ids="collectionMedia" :selected="$route.params.id" />
      </div>
    </div>
    <div v-else>
      <div class="pv2">
        <div class="bg-black absolute w-100 left-0 player-height player-top-offset">
          <div class="bg-dark-gray center player-width player-height">
            <div class="bg-black-60 center player-width player-height tc">
              <i class="fa fa-circle-o-notch fa-spin fa-3x white center loading-spinner"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import uuid from 'uuid/v4'
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
        title: this.media ? `Episode ${this.media.episode_number}: ${this.media.name} — ${this.media.collection_name}` : 'Loading...'
      }
    },
    components: {
      'umi-video': Video,
      MediaItem,
      EpisodeScroller,
      Reactotron
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
        timeout: 0,
        loading: false
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
      nextEpisodeMedia () {
        return this.$store.state.media[this.nextEpisodeId]
      },
      lights () {
        return this.$store.state.lights
      },
      malAuth () {
        return this.$store.state.malAuth
      },
      isMalAuthed () {
        return !!this.$store.state.malAuth.username
      },
      poster () {
        return this.media && this.media.screenshot_image ? this.media.screenshot_image.full_url : ''
      },
      prettyTime () {
        return prettyTime(this.internalSeek)
      },
      shouldContinueWatching () {
        if (this.$store.state.roomConnected && this.$store.state.roomData.hostOnly) {
          return this.internalSeek !== 0 && (this.media.duration - this.internalSeek >= 30) && this.$store.getters.isRoomHost
        } else {
          return this.internalSeek !== 0 && (this.media.duration - this.internalSeek >= 30)
        }
      },
      shouldNextEpisode () {
        return this.nextEpisode && this.nextEpisodeId !== ''
      },
      duration () {
        return prettyTime(this.media.duration)
      },
      optionClasses () {
        return [this.lights ? 'white b--white-60 hover-bg-transparent' : 'black b--black-20 hover-bg-light-gray bg-animate']
      }
    },
    methods: {
      async getMediaInfo () {
        const {$store, $route} = this

        this.loading = true
        await $store.dispatch('getMediaInfo', $route.params.id)
        api({route: 'info', params: {session_id: $store.state.auth.session_id, media_id: $route.params.id, fields: 'media.stream_data'}})
          .then((res) => {
            this.streamData = res.data.data.stream_data
            this.loading = false
            this.seek = 0
            this.internalSeek = this.media.playhead
          })
        await $store.dispatch('getMediaForCollection', this.media.collection_id)
        this.collectionLoaded = true
        if (this.isMalAuthed) {
          const {data: {status, item}} = await axios.get(`${UMI_SERVER}/mal/series?name=${this.media.collection_name}`)
          if (status === 'ok') {
            this.malItem = item
          }
        }
      },
      playerPlay () {
        this.internalSeek = 0
        this.nextEpisode = false
        const shouldUpdateMal = (
          this.isMalAuthed &&
          this.malItem.id &&
          this.timeout === 0 &&
          !this.malSynced &&
          process.env.NODE_ENV === 'production'
        )
        if (shouldUpdateMal) {
          this.timeout = setTimeout(async () => {
            try {
              const episode = this.collectionMedia.indexOf(this.media.media_id.toString()) + 1
              const status = (episode === this.collectionMedia.length && this.collection.complete) ? 'completed' : 'watching'
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
      continueWatching () {
        this.seek = this.internalSeek
        this.internalSeek = 0
      },
      playerEnded () {
        this.nextEpisode = true
        const newMedia = Object.assign({}, this.media, {playhead: this.media.duration})
        this.$store.commit('ADD_MEDIA', newMedia)
      },
      createRoom () {
        // this.$store.dispatch('createRoom')
        this.$store.dispatch('enterRoom', {
          id: uuid(),
          route: {
            name: this.$route.name,
            path: this.$route.path
          }
        })
        this.$store.commit('UPDATE_ROOM_MENU', true)
      }
    },
    watch: {
      mediaId (id) {
        this.nextEpisode = false
        this.malSynced = false
        clearTimeout(this.timeout)
        this.timeout = 0
        this.getMediaInfo()
        if (this.room !== '') {
          this.$router.replace({path: this.$route.path, query: Object.assign({}, this.$route.query, {roomId: this.room})})
        }
      },
      room (id) {
        if (id) {
          const newRoute = Object.assign({}, this.$route, {query: {roomId: id}})
          this.$router.replace(newRoute)
        } else {
          const newRoute = Object.assign({}, this.$route, {query: {}})
          this.$router.replace(newRoute)
        }
      }
    },
    created () {
      if (this.$route.query.roomId && !this.room) return this.$router.replace(`/room/${this.$route.query.roomId}`)

      this.getMediaInfo()
      if (this.room !== '') {
        this.$router.replace({path: this.$route.path, query: Object.assign({}, this.$route.query, {roomId: this.room})})
      }
    },
    beforeDestroy () {
      clearTimeout(this.timeout)
      this.timeout = 0
      this.$store.commit('UPDATE_LIGHTS', false)
    }
  }
</script>

<style scoped>
  .media-info {
    padding-top: 540px;
  }

  .next-episode-image, .next-episode-overlay {
    width: 160px;
    height: 90px;
  }

  .next-episode-overlay {
    top: 16px;
  }

  .next-episode-overlay i {
    margin-top: 37px;
  }

  .duration {
    z-index: 10000;
  }

  .loading-spinner {
    margin-top: 265px;
  }

  .resume-container {
    top: 521px;
  }

  .reactotron {
    top: 565px;
  }

  .next-container {
    top: 454px;
  }

  .header-bg {
    height: 4rem;
  }
</style>
