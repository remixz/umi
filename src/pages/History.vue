<template>
  <div>
    <home-tabs />
    <div class="mt4">
      <div v-if="loaded" style="width: 948px" class="center">
        <media-item v-for="d in data" :key="d.media.media_id" :id="d.media.media_id" :collectionName="d.collection.name" size="medium" />
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
        loaded: false
      }
    },
    mixins: [authCheck],
    components: {
      'media-item': MediaItem,
      'loading-media-item': LoadingMediaItem,
      'home-tabs': HomeTabs
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
