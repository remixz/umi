<template>
  <router-link :to="`/series/${data.series_id}/${id}`" class="black" :class="{'pointer-events-none o-60': isRoomGuest}" v-if="data.available">
    <div class="media-item dib v-top h-100 mr3 mb2 br2 bg-white" :class="[{'hide-child': !selected}, size]" @click="$emit('click')">
      <div class="relative">
        <img v-if="data.screenshot_image" :src="data.screenshot_image.full_url | cdnRewrite" class="w-100 image-size br2 br--top">
        <div v-else class="w-100 image-size tc placeholder-image bg-light-gray">
          <i class="fa fa-question-circle-o black-40 missing-icon" aria-hidden="true"></i>
        </div>
        <div class="bg-gray playhead playhead-container">
          <div class="bg-blue playhead" :style="playheadStyle"></div>
        </div>
        <div class="child absolute bg-black-40 top-0 image-size br2 br--top">
          <i class="fa fa-play white tc play-icon" aria-hidden="true"></i>
        </div>
      </div>
      <div class="pa2">
        <div v-if="collectionName">
          <span class="truncate db fw6 mb1 lh-copy">{{collectionName}}</span>
          <small class="gray truncate db lh-copy">#{{data.episode_number}} &bull; {{data.name}}</small>
        </div>
        <div v-else>
          <span class="truncate db fw6 mb1 lh-copy" v-if="data.episode_number !== ''">Episode {{data.episode_number}}</span>
          <span class="truncate db fw6 mb1 lh-copy" v-else>{{data.name}}</span>
          <small class="gray truncate db lh-copy" v-if="data.episode_number !== ''">{{data.name}}</small>
          <small class="gray truncate db lh-copy" v-else>&nbsp;</small>
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
      },
      isRoomGuest () {
        return this.$store.state.roomConnected && this.$store.state.roomData.hostOnly && !this.$store.getters.isRoomHost
      }
    }
  }
</script>

<style scoped>
  .media-item {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .playhead {
    height: 4px;
  }

  .playhead > div {
    width: 0;
  }

  .playhead-container {
    margin-top: -4px;
  }

  .media-item.medium {
    width: 300px;
  }

  .media-item.dashboard {
    transition: transform 0.2s ease-in-out;
    -moz-osx-font-smoothing: grayscale;
    backface-visibility: hidden;
    transform: translateZ(0);
    width: 230px;
    z-index: 2;
  }

  .media-item.dashboard:hover {
    transform: scale(1.1);
    z-index: 3;
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

  .small .image-size {
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

  .small .play-icon {
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

  .small .missing-icon {
    font-size: 1.5rem !important;
    margin-top: 30px;
  }

  .placeholder-image {
    margin-bottom: 3px;
  }
</style>
