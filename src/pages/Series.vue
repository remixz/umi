<template>
  <div>
    <div v-if="series && series.name">
      <h1>{{series.name}}</h1>
      <p>{{series.description}}</p>
      <div v-if="collections">
        <div v-if="collections.length === 1">
          <collection :id="collections[0]" :seriesId="series.series_id" />
        </div>
        <div v-else>
          <div v-for="id in collections" :key="id">
            <h2>{{$store.state.collections[id].name}}</h2>
            <collection :id="id" :seriesId="series.series_id" />
          </div>
        </div>
      </div>
      <p v-else>loading</p>
    </div>
    <h2 v-else>loading</h2>
  </div>
</template>

<script>
  import Collection from 'components/Collection'
  import {authCheck} from 'lib/auth'

  export default {
    name: 'series',
    mixins: [authCheck],
    components: {
      collection: Collection
    },
    computed: {
      series () {
        const {$store, $route} = this
        return $store.state.series[$route.params.id]
      },
      collections () {
        const {$store, $route} = this
        return $store.state.seriesCollections[$route.params.id]
      }
    },
    async beforeMount () {
      const {$store, $route} = this
      if (!$store.state.auth.username) return

      await $store.dispatch('getSeriesInfo', $route.params.id)
      await $store.dispatch('getCollectionsForSeries', this.series.series_id)
    }
  }
</script>
