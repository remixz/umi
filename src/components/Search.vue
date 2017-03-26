<template>
  <div class="dib relative" v-on-clickaway="blur">
    <form @submit.prevent="search">
      <input
        type="text"
        class="br2 br--left input-reset white bw0 bg-dark-blue search-bar"
        placeholder="Search Crunchyroll"
        v-model="searchInput"
        ref="input"
        @keydown="keydown"
        @focus="focus"
      >
      <button class="br2 br--right pointer bw0 button-reset bg-dark-blue search-btn"><i class="fa fa-search white"></i></button>
    </form>
    <div v-if="showResults" class="absolute br2 shadow-1 bg-white w-100 mt1">
      <router-link
        v-for="(series, index) in matching"
        :key="series.id"
        :to="`/series/${series.id}`"
        :data-index="index"
        :class="`db no-underline black bb b--black-40 search-result ${index === selected ? 'selected' : ''}`"
        @mouseover.native="resultHover"
        @click.native="resultPress"
      >
        <img :src="series.image" :alt="series.name">
        <span class="truncate dib f6">{{series.name}}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import { mixin as clickaway } from 'vue-clickaway'
  import { UMI_SERVER } from 'lib/api'

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
        return this.data.filter((d) => (
          d.name.replace(/\W/g, '').toLowerCase().indexOf(this.searchInput.replace(/\W/g, '').toLowerCase()) > -1
        ))
      },
      showResults () {
        return (!this.errorLoading && this.matching.length > 0) && ((this.focused && this.searchInput.length > 2) || this.selected > -1)
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
        this.selected = curr.findIndex((d) => d.id === prevMatching.id)
      }
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
        }
      },
      async focus () {
        if (this.data.length === 0 && !this.errorLoading) {
          try {
            const {data} = await axios.get(`${UMI_SERVER}/autocomplete/${this.country}`)
            this.data = data
          } catch (err) {
            this.errorLoading = true
          }
        }
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
        if (this.searchInput.trim() === '') return
        if (this.selected > -1) {
          this.$router.push(`/series/${this.matching[this.selected].id}`)
          this.searchInput = ''
        } else {
          const method = this.$route.name === 'search' ? 'replace' : 'push'
          this.$router[method](`/search?q=${this.searchInput}`)
        }
        this.$refs.input.blur()
        this.blur()
      }
    }
  }
</script>

<style scoped>
  .search-bar {
    padding: 0.5rem;
  }

  .search-bar::placeholder {
    color: white;
    opacity: 0.8;
  }

  .search-btn {
    padding: 0.5rem;
    margin-left: -5px;
  }

  .search-bar:focus, .search-btn:active, .search-btn:focus {
    outline: none;
  }

  .search-result {
    padding: 0.5rem;
    cursor: pointer;
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
    background: #f4f4f4;
  }

  .search-result.selected span, .search-result:hover span {
    font-weight: 600;
  }

  .search-result img {
    vertical-align: middle;
  }

  .search-result span {
    width: 170px;
    vertical-align: middle;
  }
</style>
