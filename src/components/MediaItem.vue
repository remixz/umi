<template>
  <router-link :to="`/series/${data.series_id}/${id}`" class="black" v-if="data.available">
    <div class="media-item dib v-top h-100 bg-near-white mr3 mb2" :class="[{'bb bw2 b--light-gray': !noBorder, 'hide-child': !selected}, size]" @click="$emit('click')">
      <div class="relative" :class="{dib: size === 'inline-small'}">
        <img v-if="data.screenshot_image" :src="data.screenshot_image.full_url" class="w-100 image-size">
        <div v-else class="w-100 image-size tc" style="margin-bottom: 3px;">
          <i class="fa fa-question-circle-o black-40 missing-icon" aria-hidden="true"></i>
        </div>
        <div class="bg-gray playhead" style="margin-top: -4px;">
          <div class="bg-blue playhead" :style="playheadStyle"></div>
        </div>
        <div class="child absolute bg-black-40 top-0 image-size">
          <i class="fa fa-play white tc play-icon" aria-hidden="true"></i>
        </div>
      </div>
      <div class="pa2" :class="{'div v-top': size === 'inline-small'}">
        <div v-if="collectionName">
          <span class="truncate db fw6">{{collectionName}}</span> <br>
          <small class="gray truncate db lh-copy">Episode {{data.episode_number}} &mdash; {{data.name}}</small>
        </div>
        <div v-else>
          <span class="fw6" v-if="data.episode_number !== ''">Episode {{data.episode_number}}</span>
          <span class="fw6" v-else>{{data.name}}</span>
          <br>
          <small class="gray truncate db lh-copy" :style="noBorder ? 'width: 290px;' : ''" v-if="data.episode_number !== ''">{{data.name}}</small>
          <small class="gray truncate db lh-copy" :style="noBorder ? 'width: 290px;' : ''" v-else>&nbsp;</small>
          <small class="truncate db mt2" style="width: 290px;" v-if="size === 'inline-small'">{{data.description}}</small>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
  export default {
    name: 'media-item',
    props: ['id', 'collectionName', 'size', 'selected', 'noBorder'],
    computed: {
      data () {
        return this.$store.state.media[this.id]
      },
      playheadStyle () {
        return {
          width: `${Math.min(100, (this.data.playhead / this.data.duration) * 100)}%`
        }
      }
    }
  }
</script>

<style scoped>
  .playhead {
    height: 4px;
  }

  .playhead > div {
    width: 0;
  }

  .media-item.medium {
    width: 300px;
  }

  .media-item.dashboard {
    width: 230px;
  }

  .media-item.small {
    width: 150px;
  }

  .medium .image-size {
    width: 300px;
    height: 168.75px;
  }

  .dashboard .image-size {
    width: 230px;
    height: 129px;
  }

  .small .image-size, .inline-small .image-size {
    width: 150px;
    height: 84px;
  }

  .medium .play-icon {
    display: block !important;
    font-size: 2rem !important;
    margin: 75px auto;
  }

  .dashboard .play-icon {
    display: block !important;
    font-size: 2rem !important;
    margin: 55px auto;
  }

  .small .play-icon, .inline-small .play-icon {
    display: block !important;
    font-size: 1.5rem !important;
    margin: 30px auto;
  }

  .medium .missing-icon {
    font-size: 2rem !important;
    margin-top: 75px;
  }

  .dashboard .missing-icon {
    font-size: 2rem !important;
    margin-top: 55px;
  }

  .small .missing-icon, .inline-small .missing-icon {
    font-size: 1.5rem !important;
    margin-top: 30px;
  }
</style>
