<template>
  <div>
    <home-tabs />
    <div class="mt4">
      <div v-if="loaded">
        <queue-item v-for="d in data" :key="d.queue_entry_id" :data="d" />
      </div>
      <div v-else>
        <div v-for="n in 10" class="bg-near-white w-100 mb2 pa3 cf bb bw2 b--light-gray">
          <div class="animated-background">
            <div class="bg-near-white absolute mask vid-sep"></div>
            <div class="bg-near-white absolute mask vid-below-line"></div>
            <div class="bg-near-white absolute mask desc-sep"></div>
            <div class="bg-near-white absolute mask line-1-sep"></div>
          </div>
        </div>
      </div>
      <h2 class="tc" v-else>Loading your queue...</h2>
    </div>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import QueueItem from 'components/QueueItem'
  import HomeTabs from 'components/HomeTabs'

  export default {
    name: 'home',
    mixins: [authCheck],
    metaInfo: {
      title: 'Queue'
    },
    data () {
      return {
        data: [],
        loaded: false
      }
    },
    components: {
      'queue-item': QueueItem,
      'home-tabs': HomeTabs
    },
    async beforeMount () {
      const {$store} = this
      if (!$store.state.auth.username) return

      const data = await $store.dispatch('getQueueInfo')
      this.loaded = true
      this.data = data
    }
  }
</script>

<style>
  @keyframes home-shimmer {
    0% {
        background-position: -992px 0
    }
    100% {
        background-position: 992px 0
    }
  }
</style>

<style scoped>
  .animated-background {
    animation: home-shimmer 1s linear infinite;
    background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
    background-size: 2000px 104px;
    height: 96px;
    position: relative;
  }

  .mask.vid-sep {
    top: 0;
    left: 160px;
    width: 35px;
    height: 100%;
  }

  .mask.vid-below-line {
    top: 90px;
    width: 160px;
    height: 7px;
  }

  .mask.desc-sep {
    top: 0;
    left: 600px;
    width: 360px;
    height: 100%;
  }

  .mask.line-1-sep {
    top: 23px;
    left: 185px;
    width: 420px;
    height: 10px;
  }
</style>
