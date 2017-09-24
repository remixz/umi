<template>
  <div>
    <div class="tr mv2">
      <span class="small-caps" v-if="loading && searchIds.length > 0">Loading...</span>
      <span class="small-caps" v-else-if="searchIds.length > 0">{{searchIds.length}} result{{searchIds.length !== 1 ? 's' : ''}}</span>
    </div>
    <div class="center results-container">
        <series-item v-for="id in searchIds" :key="id" :id="id" class="pr1" />
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
      SeriesItem
    },
    data () {
      return {
        loading: false
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
        return this.$store.state.searchQuery.trim()
      }
    },
    watch: {
      stateQuery (curr, prev) {
        if (curr !== prev && curr.trim().length > 2) {
          this.loading = true
        }
      },
      searchIds () {
        this.$router.replace(Object.assign({}, this.$route, {query: {q: this.stateQuery}}))
        this.loading = false
      }
    },
    async created () {
      const {$store, query} = this
      if (!query) return this.$router.go(-1)
      if (this.searchIds.length === 0) this.loading = true

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

<style scoped>
  .results {
    width: 880px;
  }
</style>
