<template>
  <div>
    <home-tabs />
    <div class="mt4">
      <div v-if="data.length > 0">
        <media-item v-for="d in data" :key="d.media.media_id" :id="d.media.media_id" :seriesId="d.series.series_id" :collectionName="d.collection.name" size="medium" />
      </div>
      <h2 class="tc" v-else>loading</h2>
    </div>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import MediaItem from 'components/MediaItem'
  import HomeTabs from 'components/HomeTabs'

  export default {
    name: 'home',
    data () {
      return {
        data: []
      }
    },
    mixins: [authCheck],
    components: {
      'media-item': MediaItem,
      'home-tabs': HomeTabs
    },
    async beforeMount () {
      const {$store} = this
      if (!$store.state.auth.username) return

      const data = await $store.dispatch('getHistoryInfo')
      this.data = data
    }
  }
</script>
