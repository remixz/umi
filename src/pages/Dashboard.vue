<template>
  <div>
    <div class="dashboard-section">
      <div class="cf bb">
        <h2 class="fw4 mv0 pb3 fl"><i class="fa fa-play mr1" aria-hidden="true"></i> Continue watching</h2>
        <router-link
          to="/history"
          class="fr link f6 mt1 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph2 pv1 tc"
        >
          View more
        </router-link>
      </div>
      <div v-if="history.length > 0" class="center mt3">
        <media-item v-for="d in history" :key="d.media.media_id" :id="d.media.media_id" :collectionName="d.collection.name" size="dashboard" />
      </div>
      <div v-else class="center mt3">
        <div class="tc" style="height: 215px;">
          <i class="fa fa-circle-o-notch fa-spin fa-3x silver" style="margin-top: 65px;"></i>
        </div>
      </div>
    </div>
    <div class="dashboard-section">
      <div class="cf bb">
        <h2 class="fw4 mv0 pb3 fl"><i class="fa fa-th-list mr1" aria-hidden="true"></i> Your queue</h2>
        <router-link
          to="/queue"
          class="fr link f6 mt1 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph2 pv1 tc"
        >
          View more
        </router-link>
      </div>
      <div v-if="queue.length > 0" class="center mt3">
        <media-item v-for="d in queue" :key="d.most_likely_media.media_id" :id="d.most_likely_media.media_id" :collectionName="d.series.name" size="dashboard" />
      </div>
      <div v-else class="center mt3">
        <div class="tc" style="height: 215px;">
          <i class="fa fa-circle-o-notch fa-spin fa-3x silver" style="margin-top: 65px;"></i>
        </div>
      </div>
    </div>
    <div class="dashboard-section">
      <h2 class="fw4 mv0 pb3 bb"><i class="fa fa-calendar-o mr1" aria-hidden="true"></i> Latest releases</h2>
      <div v-if="Object.keys(splits).length !== 0">
        <div v-for="(media, title) in splits" :key="title">
          <h3 class="fw4 near-black pb2 bb b--silver">{{title}}</h3>
          <div class="center">
            <media-item v-for="d in media" :key="d.media_id" :id="d.media_id" :collectionName="d.series_name" size="dashboard" />
          </div>
        </div>
      </div>
      <div v-else class="center mt3">
        <div class="tc" style="height: 436px;">
          <i class="fa fa-circle-o-notch fa-spin fa-3x silver" style="margin-top: 175px;"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import isToday from 'date-fns/is_today'
  import isYesterday from 'date-fns/is_yesterday'
  import difference from 'date-fns/difference_in_calendar_days'
  import MediaItem from 'components/MediaItem'

  export default {
    name: 'dashboard',
    metaInfo: {
      title: 'Home'
    },
    components: { MediaItem },
    data () {
      return {
        splits: {}
      }
    },
    computed: {
      name () {
        return this.$store.state.auth.username
      },
      collections () {
        return this.$store.state.collections
      },
      queue () {
        return this.$store.state.queueData
          .filter((d) => d.most_likely_media.available)
          .sort((a, b) => new Date(b.most_likely_media.available_time) - new Date(a.most_likely_media.available_time))
          .slice(0, 4)
      },
      history () {
        const initial = this.$store.state.initialHistory
        const obj = {}
        initial.forEach((d) => {
          const seriesId = d.series.series_id
          if (!obj[seriesId]) {
            obj[seriesId] = d
          }
        })

        return Object.values(obj)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 4)
      }
    },
    methods: {
      async getRecent () {
        const recent = await this.$store.dispatch('getRecentInfo')
        const splits = Object.assign({}, this.splits)
        recent.map((r) => r.most_recent_media).forEach((m) => {
          if (isToday(m.available_time)) {
            if (!splits['Today']) splits['Today'] = []
            splits['Today'].push(m)
          } else if (isYesterday(m.available_time)) {
            if (!splits['Yesterday']) splits['Yesterday'] = []
            splits['Yesterday'].push(m)
          } else {
            const ago = `${difference(new Date(), m.available_time)} days ago`
            if (!splits[ago]) splits[ago] = []
            splits[ago].push(m)
          }
        })
        this.splits = splits
      }
    },
    async created () {
      this.$store.dispatch('getHistoryInfo')
      this.$store.dispatch('getQueueInfo')
      this.getRecent()
    }
  }
</script>

<style scoped>
  .dashboard-section {
    padding-top: 15px;
  }
</style>
