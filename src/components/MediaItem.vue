<template>
  <router-link :to="`/series/${data.series_id}/${id}`" class="link black" v-if="data.available">
    <div :class="`media-item dib v-top h-100 bg-near-white mr3 mb2 bb bw2 b--light-gray ${!selected ? 'hide-child' : ''} ${size}`" @click="$emit('click')">
      <div :class="`relative ${size === 'inline-small' ? 'dib' : ''}`">
        <img :src="data.screenshot_image.full_url" class="w-100 image-size">
        <div class="bg-gray playhead" style="margin-top: -4px;">
          <div class="bg-blue playhead" :style="`width: ${(data.playhead / data.duration) * 100}%`"></div>
        </div>
        <div class="child absolute bg-black-40 top-0 image-size">
          <i class="fa fa-play white tc play-icon" aria-hidden="true"></i>
        </div>
      </div>
      <div :class="`pa2 ${size === 'inline-small' ? 'dib v-top' : ''}`">
        <div v-if="collectionName">
          <strong class="truncate db">{{collectionName}}</strong> <br>
          <small class="gray truncate db">Episode {{data.episode_number}} &mdash; {{data.name}}</small>
        </div>
        <div v-else>
          <strong>Episode {{data.episode_number}}</strong> <br>
          <small class="gray truncate db">{{data.name}}</small>
          <small class="truncate db mt2" style="width: 200px" v-if="size === 'inline-small'">{{data.description}}</small>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
  export default {
    name: 'media-item',
    props: ['id', 'collectionName', 'size', 'selected'],
    computed: {
      data () {
        return this.$store.state.media[this.id]
      }
    }
  }
</script>

<style scoped>
  .playhead {
    height: 4px;
  }

  .media-item.medium {
    width: 300px;
  }

  .media-item.small {
    width: 150px;
  }

  .medium .image-size {
    width: 300px;
    height: 168.75px;
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

  .small .play-icon, .inline-small .play-icon {
    display: block !important;
    font-size: 1.5rem !important;
    margin: 30px auto;
  }
</style>
