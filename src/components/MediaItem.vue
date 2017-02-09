<template>
  <div>
    <router-link :to="`/series/${seriesId}/${id}`">
      <p>Episode {{data.episode_number}}: {{data.name}}</p>
    </router-link>
  </div>
</template>

<script>
  export default {
    name: 'media-item',
    props: ['seriesId', 'id'],
    computed: {
      data () {
        return this.$store.state.media[this.id]
      }
    }
  }
</script>
