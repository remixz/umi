<template>
  <div>
    <home-tabs />
    <div class="mt4">
      <div v-if="loaded" style="width: 948px" class="center">
        <media-item v-for="d in data" :key="d.media.media_id" :id="d.media.media_id" :collectionName="d.collection.name" size="medium" />
      </div>
      <div v-else style="width: 948px" class="center">
        <div v-for="n in 15" class="loading-media-item dib v-top h-100 bg-near-white mr3 mb2 pa2 bb bw2 b--light-gray">
          <div class="animated-background">
            <div class="bg-near-white absolute mask vid-sep"></div>
            <div class="bg-near-white absolute mask right-block"></div>
            <div class="bg-near-white absolute mask line-block-1"></div>
            <div class="bg-near-white absolute mask line-block-2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import MediaItem from 'components/MediaItem'
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

<style>
  @keyframes history-shimmer {
    0% {
        background-position: -992px 0
    }
    100% {
        background-position: 992px 0
    }
  }
</style>

<style scoped>
  .loading-media-item {
    width: 300px;
    height: 221px;
  }

  .animated-background {
    animation: history-shimmer 1.25s linear infinite;
    background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
    background-size: 2000px 104px;
    height: 208px;
    position: relative;
  }

  .mask.vid-sep {
    top: 155px;
    height: 10px;
    width: 280px;
  }

  .mask.line-block-1 {
    top: 180px;
    height: 5px;
    width: 280px;
  }

  .mask.line-block-2 {
    top: 205px;
    height: 3px;
    width: 280px;
  }

  .mask.left-block {
    top: 155px;
    left: 0;
    height: 66px;
    width: 10px;
  }

  .mask.right-block {
    top: 155px;
    right: 0;
    height: 54px;
    width: 80px;
  }
</style>
