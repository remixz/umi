<template>
  <div class="home-tabs-padding">
    <div class="mt4">
      <div v-if="loaded" style="width: 948px" class="center">
        <media-item v-for="d in data" :key="d.media.media_id" :id="d.media.media_id" :collectionName="d.collection.name" size="medium" />
        <div :class="`f5 fw6 db ba b--black-20 ${paginationLoading ? 'bg-light-gray' : 'bg-white'} bg-animate hover-bg-light-gray black br1 pointer pa3 tc more-btn`" @click="handlePagination">{{ paginationLoading ? 'Loading...' : 'Load more'}}</div>
      </div>
      <div v-else style="width: 948px" class="center">
        <loading-media-item v-for="n in 15" :key="n" />
      </div>
    </div>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import MediaItem from 'components/MediaItem'
  import LoadingMediaItem from 'components/LoadingMediaItem'
  import HomeTabs from 'components/HomeTabs'

  export default {
    name: 'home',
    metaInfo: {
      title: 'History'
    },
    data () {
      return {
        data: [],
        loaded: false,
        paginationLoading: false,
        offset: 0
      }
    },
    mixins: [authCheck],
    components: {
      'media-item': MediaItem,
      'loading-media-item': LoadingMediaItem,
      'home-tabs': HomeTabs
    },
    methods: {
      async handlePagination () {
        this.paginationLoading = true
        this.offset += 21
        const data = await this.$store.dispatch('getHistoryInfo', {offset: this.offset})
        this.data = this.data.concat(data)
        this.paginationLoading = false
      }
    },
    async beforeMount () {
      const {$store} = this
      if (!$store.state.auth.username) return

      const data = await $store.dispatch('getHistoryInfo')
      this.loaded = true
      this.data = data
    }
  }
</script>

<style scoped>
  .more-btn {
    width: 932px;
  }
</style>
