<template>
  <div>
    <h1> Search: "{{query}}" </h1>
    <div v-if="!loading" class="center">
      <series-item v-for="id in searchIds" :key="id" :id="id" />
      <h2 v-if="searchIds.length === 0">no results</h2>
    </div>
    <h2 v-else>loading</h2>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import SeriesItem from 'components/SeriesItem'

  export default {
    name: 'search',
    mixins: [authCheck],
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
    async beforeMount () {
      const {$store, query} = this
      if (!$store.state.auth.username) return
      if (!query) return this.$router.go(-1)

      $store.commit('SET_SEARCH_QUERY', query)
      await $store.dispatch('search', query)
      this.loading = false
    },
    destroyed () {
      this.$store.commit('SET_SEARCH_QUERY', '')
    }
  }
</script>
