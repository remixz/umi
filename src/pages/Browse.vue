<template>
  <div class="mt2">
    <button class="f6 mt1 mb4 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph3 pv2 tc br2 box-shadow-umi" :class="(filter == 'popular') && 'white bg-dark-blue hover-bg-light-blue'" @click="updateFilter('popular')">Popular</button>
    <button class="f6 mt1 mb4 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph3 pv2 tc br2 box-shadow-umi" :class="(filter == 'alpha') && 'white bg-dark-blue hover-bg-light-blue'" @click="updateFilter('alpha')">Alphabetical</button>
    <button class="f6 mt1 mb4 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph3 pv2 tc br2 box-shadow-umi" :class="(filter == 'featured') && 'white bg-dark-blue hover-bg-light-blue'" @click="updateFilter('featured')">Featured</button>
    <button class="f6 mt1 mb4 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph3 pv2 tc br2 box-shadow-umi" :class="(filter == 'newest') && 'white bg-dark-blue hover-bg-light-blue'" @click="updateFilter('newest')">Newest</button>
    <button class="f6 mt1 mb4 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph3 pv2 tc br2 box-shadow-umi" :class="(filter == 'simulcast') && 'white bg-dark-blue hover-bg-light-blue'" @click="updateFilter('simulcast')">Simulcast</button>
    <button class="f6 mt1 mb4 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph3 pv2 tc br2 box-shadow-umi" :class="(filter == 'updated') && 'white bg-dark-blue hover-bg-light-blue'" @click="updateFilter('updated')">Updated</button>

    <div v-if="allData.length > 0" class="center container-width">
      <series-item v-for="d in allData" :key="d.series_id" :id="d.series_id" :noMargin="true" />
      <div class="f5 fw6 db ba b--black-20 bg-animate hover-bg-light-gray black br1 pointer pa3 tc more-btn box-shadow-umi" :class="[paginationLoading ? 'bg-light-gray' : 'bg-white']" @click="handlePagination">
        {{paginationLoading ? 'Loading...' : 'Load more'}}
      </div>
    </div>
    <div v-else class="center container-width">
      <loading-media-item v-for="n in 15" :key="n" />
    </div>
  </div>
</template>

<script>
  import SeriesItem from 'components/SeriesItem'
  import LoadingMediaItem from 'components/LoadingMediaItem'

  export default {
    name: 'browse',
    metaInfo: {
      title: 'Browse'
    },
    data: () => ({
      paginationLoading: false,
      offset: 0,
      filter: 'popular'
    }),
    computed: {
      allData () {
        return this.$store.state.seriesList
      }
    },
    components: {SeriesItem, LoadingMediaItem},
    methods: {
      async handlePagination () {
        this.paginationLoading = true
        this.offset += 50
        await this.$store.dispatch('getSeriesList', {filter: this.filter, offset: this.offset})
        this.paginationLoading = false
      },

      async updateFilter(filter) {
        this.filter = filter
        this.offset = 0

        this.$store.dispatch('clearSeriesList')

        await this.$store.dispatch('getSeriesList', {filter: this.filter, offset: this.offset})
      }
    },
    created () {
      this.$store.dispatch('getSeriesList', {filter: 'popular'})
    }
  }
</script>

<style scoped>

</style>
