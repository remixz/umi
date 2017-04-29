<template>
  <router-link :to="`/series/${data.most_likely_media.series_id}/${data.most_likely_media.media_id}`" class="link black" v-if="data.most_likely_media.available">
    <div class="bg-near-white w-100 mb2 pa3 cf bb bw2 b--light-gray hide-child">
      <div class="fl w-20 relative">
        <img :src="data.most_likely_media.screenshot_image.thumb_url" class="v-mid" style="width: 160px; height: 90px">
        <div class="bg-gray mt1 playhead">
          <div class="bg-blue playhead" :style="`width: ${Math.min(100, (data.most_likely_media.playhead / data.most_likely_media.duration) * 100)}%`"></div>
        </div>
        <div class="child absolute bg-black-40 top-0" style="width: 160px; height: 90px">
          <i class="fa fa-play white tc play-icon" aria-hidden="true"></i>
        </div>
      </div>
      <div class="fl w-80">
        <strong class="fw6">{{data.series.name}}</strong> <br>
        <small class="gray">Next up: Episode {{data.most_likely_media.episode_number}} &mdash; {{data.most_likely_media.name}}</small>
        <p class="lh-copy" style="font-size: 80%;">{{data.most_likely_media.description}}</p>
      </div>
    </div>
  </router-link>
  <router-link :to="`/series/${data.most_likely_media.series_id}`" class="link black" v-else>
    <div class="bg-near-white w-100 mb2 pa3 cf bb bw2 b--light-gray hide-child">
      <div class="fl w-20 relative">
        <img :src="data.series.landscape_image.thumb_url" class="v-mid" style="width: 160px; height: 90px">
        <div class="child absolute bg-black-40 top-0" style="width: 160px; height: 90px">
          <i class="fa fa-clock-o white tc play-icon" aria-hidden="true"></i>
        </div>
      </div>
      <div class="fl w-80">
        <strong class="fw6">{{data.series.name}}</strong> <br>
        <small class="gray">Next up: Episode {{data.most_likely_media.episode_number}}</small>
        <p class="lh-copy" style="font-size: 80%;">Available to watch in {{parsedTime}}</p>
      </div>
    </div>
  </router-link>
</template>

<script>
  import distance from 'date-fns/distance_in_words_to_now'

  export default {
    props: ['data'],
    computed: {
      parsedTime () {
        return distance(this.data.most_likely_media.available_time)
      }
    }
  }
</script>

<style scoped>
  .playhead {
    width: 160px;
    height: 4px;
  }

  .play-icon {
    display: block !important;
    font-size: 2rem !important;
    margin: 29px auto;
  }
</style>
