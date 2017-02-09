<template>
  <div>
    <h1> queue </h1>
    <div v-if="queueIds.length > 0">
      <series-item v-for="id in queueIds" :key="id" :id="id" />
    </div>
    <h2 v-else>loading</h2>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {authCheck} from 'lib/auth'
  import SeriesItem from 'components/SeriesItem'

  export default {
    name: 'home',
    computed: mapState(['queueIds']),
    mixins: [authCheck],
    components: {
      'series-item': SeriesItem
    },
    beforeMount () {
      const {$store} = this
      if (!$store.state.auth.username) return

      $store.dispatch('getQueueInfo')
    }
  }
</script>
