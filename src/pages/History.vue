<template>
  <div>
    <home-tabs />
    <div class="mt4">
      <div v-if="historyIds.length > 0">
        <media-item v-for="id in historyIds" :key="id" :id="id" :seriesId="$store.state.media[id].series_id" />
      </div>
      <h2 v-else>loading</h2>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {authCheck} from 'lib/auth'
  import MediaItem from 'components/MediaItem'
  import HomeTabs from 'components/HomeTabs'

  export default {
    name: 'home',
    computed: mapState(['historyIds']),
    mixins: [authCheck],
    components: {
      'media-item': MediaItem,
      'home-tabs': HomeTabs
    },
    beforeMount () {
      const {$store} = this
      if (!$store.state.auth.username) return

      $store.dispatch('getHistoryInfo')
    }
  }
</script>
