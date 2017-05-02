<template>
  <div>
    <div class="tr mv2">
      <span class="small-caps" v-if="loading && searchIds.length > 0">Loading...</span>
      <span class="small-caps" v-else-if="searchIds.length > 0">{{searchIds.length}} result{{searchIds.length !== 1 ? 's' : ''}}</span>
    </div>
    <div class="center" style="width: 880px;">
        <series-item v-for="id in searchIds" :key="id" :id="id" />
        <h3 class="fw5 dark-gray tc" v-if="loading && searchIds.length === 0">Loading...</h3>
        <h3 class="fw5 dark-gray tc" v-if="searchIds.length === 0 && !loading">No results found.</h3>
    </div>
  </div>
</template>

<script>
  import SeriesItem from 'components/SeriesItem'

  export default {
    name: 'search',
    metaInfo () {
      return {
        title: `Search: "${this.query}"`
      }
    },
    components: {
      'series-item': SeriesItem
    },
    data () {
      return {
        loading: true
      }
    },
    computed: {
      searchIds () {
        return this.$store.state.searchIds
      },
      query () {
        return this.$route.query.q
      },
      stateQuery () {
        return this.$store.state.searchQuery
      }
    },
    watch: {
      async query () {
        const {$store, query} = this
        if (!query) return this.$router.go(-1)
        this.loading = true
        await $store.dispatch('search', query)
        this.loading = false
      }
    },
    async created () {
      const {$store, query} = this
      if (!query) return this.$router.go(-1)

      if (this.stateQuery === '') {
        $store.commit('SET_SEARCH_QUERY', query)
      }
      await $store.dispatch('search', query)
      this.loading = false
    },
    destroyed () {
      this.$store.commit('SET_SEARCH_QUERY', '')
      this.$store.commit('SET_SEARCH_IDS', [])
    }
  }
</script>
