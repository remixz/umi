<template>
  <div>
    <div v-if="series && series.name">
      <div class="cf">
        <div class="w-20 fl pt2">
          <img :src="series.portrait_image.full_url" >
        </div>
        <div class="w-80 fl pl3">
          <h1 class="fw6">{{series.name}}</h1>
          <p class="lh-copy">{{series.description}}</p>
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
          <div :class="`cf bg-light-gray pa3 mv2 ${selectedCollection !== id ? 'pointer' : ''} bb bw2 b--black-10`" :data-id="id" @click="selectCollection">
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
    <div v-else-if="seriesError">
      <h1 class="fw6">This series is not available.</h1>
    </div>
  </div>
</template>

<script>
  import Collection from 'components/Collection'
  import QueueButton from 'components/QueueButton'

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
        sort: 'new',
        seriesError: false
      }
    },
    computed: {
      seriesId () {
        return this.$route.params.id
      },
      series () {
        const {$store, $route} = this
        return $store.state.series[this.seriesId]
      },
      collections () {
        const {$store, $route} = this
        return $store.state.seriesCollections[this.seriesId]
      },
      sortedCollections () {
        return this.sort === 'old' ? this.collections : Array.from(this.collections).reverse()
      },
      collectionData () {
        return this.$store.state.collections
      }
    },
    methods: {
      async getSeriesInfo () {
        const {$store, $route} = this

        try {
          await $store.dispatch('getSeriesInfo', this.seriesId)
          await $store.dispatch('getCollectionsForSeries', this.series.series_id)
          this.selectedCollection = this.sortedCollections[0]
        } catch (err) {
          this.seriesError = true
        }
      },
      selectCollection ({target}) {
        if (this.selectedCollection === target.dataset.id) return

        this.selectedCollection = target.dataset.id
        this.$nextTick(() => {
          target.scrollIntoView()
        })
      },
      sortCollection ({target}) {
        this.sort = target.dataset.sort
        this.selectedCollection = this.sortedCollections[0]
      }
    },
    watch: {
      seriesId (curr) {
        this.seriesError = false
        this.getSeriesInfo()
      }
    },
    async beforeMount () {
      this.getSeriesInfo()
    }
  }
</script>
