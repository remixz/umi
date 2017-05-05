<template>
  <div v-if="series && series.name">
    <div class="absolute w-100 player-top-offset left-0 overflow-hidden" style="height: 300px;">
      <video v-if="opening" class="w-100 absolute top-0" :src="opening" @playing="playing = true" muted loop autoplay></video>
      <div :class="`w-100 cover bg-center absolute video-banner ${playing ? 'away' : ''}`" :style="`background-image: url(${series.landscape_image.full_url});`"></div>
      <div class="w-100 bg-black o-40 absolute" style="height: 300px;"></div>
    </div>
    <div class="relative z-9999" style="margin-top: 150px;">
      <div class="cf">
        <div class="w-20 fl pt2">
          <img :src="series.portrait_image.full_url" class="shadow-1">
        </div>
        <div class="w-80 fl pl3">
          <h1 class="series-title poppins white" style="margin-top: 5rem;">{{series.name}}</h1>
          <p class="lh-copy" style="margin-top: 2rem;">{{series.description}}</p>
          <queue-button :id="series.series_id" />
          <a class="link f6 fw6 dib ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph2 pv1" target="_blank" :href="`https://myanimelist.net/search/all?q=${encodeURIComponent(series.name)}`">Find on MyAnimeList</a>
        </div>
      </div>
      <div class="relative">
        <div class="absolute right-0 bottom-0">
          <div :class="`fw5 ph3 pv2 bg-white pointer f6 dib ${sort === 'old' ? 'bb bw1 b--blue' : ''}`" data-sort="old" @click="sortCollection">Oldest</div>
          <div :class="`fw5 ph3 pv2 bg-white pointer f6 dib ${sort === 'new' ? 'bb bw1 b--blue' : ''}`" data-sort="new" @click="sortCollection">Newest</div>
        </div>
      </div>
      <div v-if="collections">
        <div v-for="id in sortedCollections" :key="id">
          <div class="collection-header cf bg-light-gray pa3 mv2 pointer bb bw2 b--black-10" :data-id="id" @click="selectCollection">
            <div class="fl">
              <span class="fw6">{{collectionData[id].name}}</span>
            </div>
            <div class="fr">
              <i :class="`fa fa-caret-${selectedCollection === id ? 'up' : 'down'}`" aria-hidden="true"></i>
            </div>
          </div>
          <collection :id="id" :hide="selectedCollection !== id" :sort="sort" class="center" style="width: 948px" />
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="seriesError">
    <h1 class="fw6">This series is not available.</h1>
  </div>
</template>

<script>
  import axios from 'axios'
  import Collection from 'components/Collection'
  import QueueButton from 'components/QueueButton'
  import { UMI_SERVER } from 'lib/api'

  const openingOverrides = {
    '269071': 'konosuba',
    '42852': 'Naruto: Shippuden'
  }

  export default {
    name: 'series',
    metaInfo () {
      return {
        title: this.series ? this.series.name : 'Loading...'
      }
    },
    components: {
      collection: Collection,
      'queue-button': QueueButton
    },
    data () {
      return {
        selectedCollection: '',
        sort: localStorage.getItem(`series-${this.$route.params.id}-sort`) || 'new',
        seriesError: false,
        opening: null,
        playing: false
      }
    },
    computed: {
      seriesId () {
        return this.$route.params.id
      },
      series () {
        const {$store} = this
        return $store.state.series[this.seriesId]
      },
      collections () {
        const {$store} = this
        return $store.state.seriesCollections[this.seriesId]
      },
      sortedCollections () {
        return this.sort === 'old' ? this.collections : this.collections.slice(0).reverse()
      },
      collectionData () {
        return this.$store.state.collections
      }
    },
    methods: {
      async getSeriesInfo () {
        const {$store} = this

        try {
          await $store.dispatch('getSeriesInfo', this.seriesId)
          await $store.dispatch('getCollectionsForSeries', this.series.series_id)
          this.selectedCollection = this.sortedCollections[0]
          this.getOpening()
        } catch (err) {
          this.seriesError = true
        }
      },
      async getOpening () {
        const query = openingOverrides[this.seriesId] || this.series.name
        const {data: {result}} = await axios.get(`${UMI_SERVER}/opening?search=${query}`)
        this.opening = result
      },
      selectCollection ({target}) {
        if (this.selectedCollection === target.dataset.id) {
          this.selectedCollection = -1
          return
        }

        this.selectedCollection = target.dataset.id
      },
      sortCollection ({target}) {
        this.sort = target.dataset.sort
        this.selectedCollection = this.sortedCollections[0]
        localStorage.setItem(`series-${this.seriesId}-sort`, target.dataset.sort)
      }
    },
    watch: {
      seriesId (curr) {
        this.opening = null
        this.playing = false
        this.seriesError = false
        this.getSeriesInfo()
      }
    },
    created () {
      this.getSeriesInfo()
    }
  }
</script>

<style scoped>
  .collection-header * {
    pointer-events: none;
  }

  video {
    transform: translateY(-45%);
  }

  .video-banner {
    height: 300px;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }

  .video-banner.away {
    opacity: 0;
  }

  .series-title {
    text-shadow: 0px 4px 3px rgba(0,0,0,0.4), 0px 8px 13px rgba(0,0,0,0.1), 0px 18px 23px rgba(0,0,0,0.1);
  }
</style>
