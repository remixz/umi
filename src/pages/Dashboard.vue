<template>
  <div>
    <img :src="time.icon" class="dib v-mid relative z-2" style="width: 75px;">
    <div class="dib v-mid ml2">
      <h1 class="near-black poppins mb0">{{time.greeting}}, <span :class="{editable: !displayName}" @click="editName">{{displayName || name}}</span>.</h1>
      <p class="gray mt0 fw5">Here's your dashboard:</p>
    </div>
    <div class="dashboard-section">
      <h2 class="fw4 mv0 pb3 bb poppins"><i class="fa fa-play mr1" aria-hidden="true"></i> Continue watching</h2>
      <div v-if="history.length > 0" class="center mt3" style="width: 798px;">
        <media-item v-for="d in history" :key="d.media.media_id" :id="d.media.media_id" :collectionName="d.collection.name" size="dashboard" />
        <router-link class="link f5 fw6 db ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer pa3 tc" style="width: 782px;" to="/history">View full history</router-link>
      </div>
      <div v-else class="center mt3" style="width: 798px;">
        <div class="tc" style="height: 436px;">
          <i class="fa fa-circle-o-notch fa-spin fa-3x silver" style="margin-top: 175px;"></i>
        </div>
        <router-link class="link f5 fw6 db ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer pa3 tc" style="width: 782px;" to="/history">View full history</router-link>
      </div>
    </div>
    <div class="dashboard-section">
      <h2 class="fw4 mv0 pb3 bb poppins"><i class="fa fa-th-list mr1" aria-hidden="true"></i> Your queue</h2>
      <div v-if="queue.length > 0" class="center mt3" style="width: 798px;">
        <media-item v-for="d in queue" :key="d.most_likely_media.media_id" :id="d.most_likely_media.media_id" :collectionName="d.series.name" size="dashboard" />
        <router-link class="link f5 fw6 db ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer pa3 tc" style="width: 782px;" to="/queue">View queue</router-link>
      </div>
      <div v-else class="center mt3" style="width: 798px;">
        <div class="tc" style="height: 436px;">
          <i class="fa fa-circle-o-notch fa-spin fa-3x silver" style="margin-top: 175px;"></i>
        </div>
        <router-link class="link f5 fw6 db ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer pa3 tc" style="width: 782px;" to="/queue">View queue</router-link>
      </div>
    </div>
    <div class="dashboard-section">
      <h2 class="fw4 mv0 pb3 bb poppins"><i class="fa fa-calendar-o mr1" aria-hidden="true"></i> Latest releases</h2>
      <div v-if="Object.keys(splits).length !== 0">
        <div v-for="(media, title) in splits">
          <h3 class="fw4 near-black pb2 bb b--silver">{{title}}</h3>
          <div class="center" style="width: 798px;">
            <media-item v-for="d in media" :key="d.media_id" :id="d.media_id" :collectionName="d.series_name" size="dashboard" />
          </div>
        </div>
        <div v-if="!finishedLatest" class="center pointer f5 fw6 db ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer pa3 tc" @click="getRecent" style="width: 782px;">{{latestLoading ? 'Loading...' : 'Load more'}}</div>
      </div>
      <div v-else class="center mt3" style="width: 798px;">
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
        history: [],
        queue: [],
        splits: {},
        latestLoading: false,
        finishedLatest: false,
        offset: 0
      }
    },
    computed: {
      time () {
        const hours = (new Date()).getHours()

        if (hours >= 5 && hours <= 11) {
          return {
            icon: require('../assets/morning.svg'),
            greeting: 'Ohayō'
          }
        } else if (hours >= 12 && hours <= 17) {
          return {
            icon: require('../assets/afternoon.svg'),
            greeting: 'Konnichiwa'
          }
        } else {
          return {
            icon: require('../assets/evening.svg'),
            greeting: 'Konbanwa'
          }
        }
      },
      displayName () {
        return this.$store.state.displayName
      },
      name () {
        return this.$store.state.auth.username
      },
      collections () {
        return this.$store.state.collections
      }
    },
    methods: {
      editName () {
        if (this.displayName) return

        this.$router.push('/settings')
      },
      async getRecent () {
        this.latestLoading = true
        const recent = await this.$store.dispatch('getRecentInfo', {offset: this.offset})
        if (recent.length === 0) {
          this.latestLoading = false
          this.finishedLatest = true
          return
        }
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
        this.latestLoading = false
        this.offset = this.offset + 50
        if (recent.length < 50) {
          this.finishedLatest = true
        }
      }
    },
    async created () {
      const history = await this.$store.dispatch('getHistoryInfo', {limit: 50})
      const obj = {}
      history.forEach((d) => {
        const seriesId = d.series.series_id
        if (!obj[seriesId]) {
          obj[seriesId] = d
        }
      })
      this.history = Object.values(obj).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6)

      const queue = await this.$store.dispatch('getQueueInfo')
      this.queue = queue.filter((d) => d.most_likely_media.available).slice(0, 6)

      this.getRecent()
    }
  }
</script>

<style scoped>
  .editable {
    border-bottom: 1px dashed black;
    display: inline-block;
    cursor: pointer;
  }

  .dashboard-section {
    border-left: 3px solid #e8e8e8;
    padding: 35px 50px 0 50px;
    position: relative;
    left: 36px;
    top: -10px;
  }

  .dashboard-section h2:after {
    position: absolute;
    width: 21px;
    height: 21px;
    background-color: #e8e8e8;
    border-radius: 100%;
    content: '';
    left: -12px;
    top: 38px;
  }
</style>
