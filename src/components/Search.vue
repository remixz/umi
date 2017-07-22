<template>
  <div class="dib relative" v-on-clickaway="blur">
    <form @submit.prevent="search">
      <input
        type="text"
        class="br2 br--left input-reset white bw0 bg-dark-blue pa2 search-bar"
        placeholder="Search Crunchyroll"
        v-model="searchInput"
        ref="input"
        @keydown="keydown"
        @focus="focus"
      >
      <button class="br2 br--right pointer bw0 button-reset bg-dark-blue pa2 search-btn"><i class="fa fa-search white"></i></button>
    </form>
    <div v-if="showResults" class="absolute br2 shadow-1 bg-white w-100 mt1">
      <router-link
        v-for="(id, index) in matching"
        :key="id"
        :to="`/series/${id}`"
        :data-index="index"
        class="db no-underline black bb b--black-40 pa2 search-result"
        :class="{selected: selected === index}"
        @mouseover.native="resultHover"
        @click.native="resultPress"
      >
        <img class="v-mid" :src="series[id].landscape_image.small_url" :alt="series[id].name">
        <span class="truncate dib f6 v-mid">{{series[id].name}}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
  import debounce from 'debounce'
  import { mixin as clickaway } from 'vue-clickaway'

  export default {
    name: 'search',
    mixins: [ clickaway ],
    data () {
      return {
        data: [],
        errorLoading: false,
        selected: -1,
        focused: false
      }
    },
    computed: {
      country () {
        return this.$store.state.auth.country
      },
      searchInput: {
        get () {
          return this.$store.state.searchQuery
        },
        set (value) {
          this.$store.commit('SET_SEARCH_QUERY', value)
        }
      },
      matching () {
        return this.$store.state.searchIds.slice(0, 5)
      },
      series () {
        return this.$store.state.series
      },
      showResults () {
        return (
          this.$route.name !== 'search' &&
          (!this.errorLoading && this.matching.length > 0) &&
          ((this.focused && this.searchInput.replace(/\W/g, '').length > 2) || this.selected > -1)
        )
      }
    },
    watch: {
      matching (curr, prev) {
        if (this.selected === -1) return
        if (this.searchInput.length < 3) {
          this.selected = -1
          return
        }

        const prevMatching = prev[this.selected]
        this.selected = curr.findIndex((d) => d === prevMatching)
      },
      searchInput: debounce(function (curr, prev) {
        const trimmed = curr.trim()
        if (trimmed === '' || trimmed === prev || trimmed.length < 3) return

        this.$store.dispatch('search', trimmed)
      }, 250)
    },
    methods: {
      keydown (e) {
        if (e.which === 38) { // up
          if (this.searchInput === '' || this.searchInput.length < 3) return
          e.preventDefault()
          this.selected -= 1
          if (this.selected < -1) {
            this.selected = this.matching.length - 1
          }
        } else if (e.which === 40) { // down
          if (this.searchInput === '' || this.searchInput.length < 3) return
          e.preventDefault()
          this.selected += 1
          if (this.selected > this.matching.length - 1) {
            this.selected = -1
          }
        } else if (e.which === 27) { // escape
          this.focused = false
          this.selected = -1
          this.$refs.input.blur()
        }
      },
      focus () {
        this.focused = true
      },
      blur () {
        this.selected = -1
        this.focused = false
      },
      resultHover ({target}) {
        this.selected = parseInt(target.dataset.index, 10)
      },
      resultPress () {
        this.selected = -1
        this.focused = false
        this.searchInput = ''
      },
      search () {
        const trimmed = this.searchInput.trim()
        if (trimmed === '' || trimmed.length < 3) return
        if (this.selected > -1) {
          this.$router.push(`/series/${this.matching[this.selected]}`)
          this.searchInput = ''
        } else {
          const method = this.$route.name === 'search' ? 'replace' : 'push'
          this.$router[method](`/search?q=${trimmed}`)
        }
        this.$refs.input.blur()
        this.blur()
      }
    }
  }
</script>

<style scoped>
  .search-bar::placeholder {
    color: white;
    opacity: 0.8;
  }

  .search-btn {
    margin-left: -5px;
  }

  .search-bar:focus, .search-btn:active, .search-btn:focus {
    outline: none;
  }

  .search-result:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }

  .search-result:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    border: 0;
  }

  .search-result.selected, .search-result:hover {
    background-color: #357edd;
  }

  .search-result.selected span, .search-result:hover span {
    color: #fff;
    font-weight: 600;
  }

  .search-result span {
    width: 170px;
  }
</style>
