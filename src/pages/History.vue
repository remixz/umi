<template>
  <div class="mt2">
    <div v-if="allData.length > 0" style="width: 948px" class="center">
      <media-item v-for="d in allData" :key="d.media.media_id" :id="d.media.media_id" :collectionName="d.collection.name" size="medium" />
      <div class="f5 fw6 db ba b--black-20 bg-animate hover-bg-light-gray black br1 pointer pa3 tc more-btn" :class="[paginationLoading ? 'bg-light-gray' : 'bg-white']" @click="handlePagination">
        {{paginationLoading ? 'Loading...' : 'Load more'}}
      </div>
    </div>
    <div v-else style="width: 948px" class="center">
      <loading-media-item v-for="n in 15" :key="n" />
    </div>
  </div>
</template>

<script>
  import MediaItem from 'components/MediaItem'
  import LoadingMediaItem from 'components/LoadingMediaItem'

  export default {
    name: 'home',
    metaInfo: {
      title: 'History'
    },
    data () {
      return {
        data: [],
        paginationLoading: false,
        offset: 0
      }
    },
    computed: {
      allData () {
        return this.$store.state.initialHistory.concat(this.data)
      }
    },
    components: {
      'media-item': MediaItem,
      'loading-media-item': LoadingMediaItem
    },
    methods: {
      async handlePagination () {
        this.paginationLoading = true
        this.offset += 24
        const data = await this.$store.dispatch('getHistoryInfo', {offset: this.offset})
        this.data = this.data.concat(data)
        this.paginationLoading = false
      }
    },
    created () {
      this.$store.dispatch('getHistoryInfo')
    }
  }
</script>

<style scoped>
  .more-btn {
    width: 932px;
  }
</style>
