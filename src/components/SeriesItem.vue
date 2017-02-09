<template>
  <div>
    <router-link :to="`/series/${id}`"><p>{{data.name}}</p></router-link>
  </div>
</template>

<script>
  export default {
    name: 'series-item',
    props: ['id'],
    computed: {
      data () {
        return this.$store.state.series[this.id]
      }
    }
  }
</script>
