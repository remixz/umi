<template>
  <router-link :to="`/series/${id}`" class="link" v-if="data">
    <div class="dib mb2 hide-child relative bg-near-white series-item" :class="{mr3: noMargin}">
      <img :src="data.portrait_image.thumb_url">
      <div class="child absolute absolute--fill bg-black-60 pa2">
        <p class="b white tc f5">{{data.name}}</p>
      </div>
    </div>
  </router-link>
</template>

<script>
  export default {
    name: 'series-item',
    props: ['id', 'noMargin'],
    computed: {
      data () {
        return this.$store.state.series[this.id]
      }
    }
  }
</script>

<style scoped>
  .series-item {
    width: 160px;
    height: 240px;
  }
</style>
