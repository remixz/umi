<template>
  <div class="mt2">
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
      data: [],
      paginationLoading: false,
      offset: 0
    }),
    computed: {
      allData () {
        return this.$store.state.seriesList.concat(this.data)
      }
    },
    components: {SeriesItem, LoadingMediaItem},
    methods: {
      async handlePagination () {
        this.paginationLoading = true
        this.offset += 50
        const data = await this.$store.dispatch('getSeriesList', {filter: 'popular', offset: this.offset})
        this.data = this.data.concat(data)
        this.paginationLoading = false
      }
    },
    created () {
      this.$store.dispatch('getSeriesList', {filter: 'popular'})
    }
  }
</script>

<style scoped>

</style>
