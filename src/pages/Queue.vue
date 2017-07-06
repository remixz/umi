<template>
  <div>
    <div class="relative cf mb2">
      <div class="fr">
        <div class="fw5 ph3 pv2 bg-white pointer f6 dib" :class="{'bb bw1 b--blue': sort === 'recent'}" data-sort="recent" @click="sortQueue">Recently updated</div>
        <div class="fw5 ph3 pv2 bg-white pointer f6 dib" :class="{'bb bw1 b--blue': sort === 'order'}" data-sort="order" @click="sortQueue">Queue order</div>
      </div>
    </div>
    <div v-if="loaded">
      <queue-item v-for="d in sortedData" :key="d.queue_entry_id" :data="d" />
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
</template>

<script>
  import QueueItem from 'components/QueueItem'

  export default {
    name: 'queue',
    metaInfo: {
      title: 'Queue'
    },
    data () {
      return {
        requested: false,
        sort: localStorage.getItem('queue-sort') || 'recent'
      }
    },
    computed: {
      data () {
        return this.$store.state.queueData
      },
      loaded () {
        return this.data.length > 0 || this.data.length === 0 && this.requested
      },
      sortedData () {
        return this.sort === 'recent' ? this.data.slice(0).sort((a, b) => new Date(b.most_likely_media.available_time) - new Date(a.most_likely_media.available_time)) : this.data
      }
    },
    components: {
      'queue-item': QueueItem
    },
    methods: {
      sortQueue ({target}) {
        this.sort = target.dataset.sort
        localStorage.setItem('queue-sort', target.dataset.sort)
      }
    },
    async created () {
      const {$store} = this

      await $store.dispatch('getQueueInfo')
      this.requested = true
    }
  }
</script>

<style scoped>
  .animated-background {
    animation: loading-shimmer 1s linear infinite;
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
