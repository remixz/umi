<template>
  <div>
    <div v-if="seriesError">
      <h1 class="fw6">This series is not available.</h1>
    </div>
    <div id="video-banner" class="absolute w-100 top-0 left-0 overflow-hidden video-banner-height">
      <video v-if="opening" class="w-100 absolute top-0" :src="opening" @playing="playing = true" muted loop autoplay></video>
      <div class="w-100 cover bg-center absolute video-banner" :class="{away: playing}" :style="videoBannerStyle"></div>
      <div class="w-100 bg-black o-40 absolute video-banner-height"></div>
    </div>
    <div class="relative z-9999 info-container">
      <div class="cf">
        <div class="w-20 fl pt2">
          <img :src="series.portrait_image.full_url" class="shadow-1 bg-light-gray portrait-image">
        </div>
        <div class="w-80 fl pl3">
          <h1 class="series-title white fw6">{{series.name || '&nbsp;'}}</h1>
          <p class="lh-copy mt4">{{series.description}}</p>
          <div v-if="!loading">
            <queue-button :id="series.series_id" />
            <a class="link f6 fw6 dib ba b--black-20 bg-white bg-animate hover-bg-light-gray black br2 box-shadow-umi pointer ph2 pv1" target="_blank" :href="`https://myanimelist.net/search/all?q=${encodeURIComponent(series.name)}`">Find on MyAnimeList</a>
          </div>
          <div class="center tc" v-else>
            <i class="fa fa-circle-o-notch fa-spin fa-3x silver mt3"></i>
          </div>
        </div>
      </div>
      <div class="relative" v-if="!loading">
        <div class="absolute right-0 bottom-0">
          <div class="fw5 ph3 pv2 bg-white pointer f6 dib" :class="{'bb bw1 b--blue': sort === 'old'}" data-sort="old" @click="sortCollection">Oldest</div>
          <div class="fw5 ph3 pv2 bg-white pointer f6 dib" :class="{'bb bw1 b--blue': sort === 'new'}" data-sort="new" @click="sortCollection">Newest</div>
        </div>
      </div>
      <div v-if="collections && !loading">
        <div v-for="id in sortedCollections" :key="id">
          <div class="collection-header bg-near-white cf pa3 mv2 pointer br2 box-shadow-umi" :data-id="id" @click="selectCollection">
            <div class="fl">
              <span class="fw6">{{collectionData[id].name}}</span>
            </div>
            <div class="fr">
              <i class="fa" :class="[`fa-caret-${selectedCollection === id ? 'up' : 'down'}`]" aria-hidden="true"></i>
            </div>
          </div>
          <collection :id="id" :hide="selectedCollection !== id" :sort="sort" class="center container-width" />
        </div>
      </div>
    </div>
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
      Collection,
      QueueButton
    },
    data () {
      return {
        selectedCollection: '',
        sort: localStorage.getItem(`series-${this.$route.params.id}-sort`) || 'new',
        seriesError: false,
        opening: null,
        playing: false,
        loading: true
      }
    },
    computed: {
      seriesId () {
        return this.$route.params.id
      },
      series () {
        const {$store} = this
        return this.loading ? {
          landscape_image: {},
          portrait_image: {}
        } : $store.state.series[this.seriesId]
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
      },
      videoBannerStyle () {
        return {
          'background-image': `url(${this.series.landscape_image.full_url})`
        }
      }
    },
    methods: {
      async getSeriesInfo () {
        const {$store} = this

        try {
          await $store.dispatch('getSeriesInfo', this.seriesId)
          this.loading = false
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
      },
      intersectCallback ([entry]) {
        this.header.classList.add('bg-animate')

        if (entry.isIntersecting) {
          this.header.classList.add('alt-header')
        } else {
          this.header.classList.remove('alt-header')
        }
      }
    },
    watch: {
      seriesId (curr) {
        this.opening = null
        this.playing = false
        this.seriesError = false
        this.loading = true
        this.getSeriesInfo()
      }
    },
    created () {
      this.getSeriesInfo()
    },
    mounted () {
      if (typeof window.IntersectionObserver === 'function') {
        this.header = document.querySelector('header')
        this.intersect = new IntersectionObserver(this.intersectCallback, {
          threshold: [0, 1]
        })

        const banner = document.querySelector('#video-banner')
        this.intersect.observe(banner)
      }
    },
    beforeDestroy () {
      if (this.intersect) {
        this.header.classList.remove('bg-animate')

        this.intersect.disconnect()
      }
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
    height: 364px;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }

  .video-banner.away {
    opacity: 0;
  }

  .video-banner-height {
    height: 364px;
  }

  .info-container {
    margin-top: 150px;
  }

  .series-title {
    text-shadow: 0px 4px 3px rgba(0,0,0,0.4), 0px 8px 13px rgba(0,0,0,0.1), 0px 18px 23px rgba(0,0,0,0.1);
    margin-top: 5rem;
  }

  .portrait-image {
    width: 198px;
    height: 298px;
  }
</style>
