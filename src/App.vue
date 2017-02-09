<template>
  <div class="sans-serif" id="app">
    <header class="bg-blue relative shadow-1 header">
      <router-link class="link white f3 dib tracked absolute bottom-0 left-2" to="/" title="Home">
        <img src="./assets/umi.png" alt="umi logo" class="logo">
        <span class="relative logo-text">umi</span>
      </router-link>
      <section class="absolute search-bar">
        <input type="text" class="w-100 bn pa3 f3 white search-input" placeholder="Search...." v-model="searchInput" @input="inputChange">
      </section>
      <section class="absolute right-1 username white f4">
        {{ username }}
      </section>
    </header>

    <main class="ph3">
      <h1 class="tc" v-if="loading">loading</h1>
      <transition name="fade" mode="out-in" v-else>
        <router-view></router-view>
      </transition>
    </main>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'app',
  data () {
    return {
      loading: true
    }
  },
  metaInfo: {
    title: `Umi`
  },
  computed: {
    username () {
      return this.$store.state.auth.username
    },
    searchInput () {
      return this.$store.state.searchQuery
    }
  },
  methods: {
    inputChange (e) {
      this.$store.commit('SET_SEARCH_QUERY', e.target.value)
      this.goToSearch(this.searchInput, this.$route, this.$router)
    },
    goToSearch: _.debounce((input, route, router) => {
      const method = route.name === 'search' ? 'replace' : 'push'
      router[method](`/search?q=${input}`)
    }, 500)
  },
  async beforeMount () {
    await this.$store.dispatch('startSession')
    this.loading = false
  }
}
</script>

<style>
  body {
    background: #f4f4f4;
  }

  .header {
    width: 100%;
    height: 4rem;
  }

  .logo {
    height: 55px;
    vertical-align: bottom;
  }

  .logo-text {
    top: -18px;
  }

  .search-bar {
    width: 70%;
    left: 11rem;
  }

  .search-input {
    height: 4rem;
    background-color: #2c60a2;
  }

  .search-input::placeholder {
    color: white;
    opacity: 0.8;
  }

  .username {
    top: 0.5rem;
  }

  .fade-enter-active, .fade-leave-active {
    transition: all .2s ease;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0;
  }
</style>
