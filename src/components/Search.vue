<template>
  <div class="dib relative">
    <form @submit.prevent="search">
      <input
        type="text"
        class="br2 br--left input-reset white bw0 bg-dark-blue search-bar"
        placeholder="Search Crunchyroll"
        v-model="searchInput"
        ref="input"
        @keydown="keydown"
        @focus="focus"
        @blur="blur"
      >
      <button class="br2 br--right pointer bw0 button-reset bg-dark-blue search-btn"><i class="fa fa-search white"></i></button>
    </form>
    <div v-if="showResults" class="absolute br2 shadow-1 bg-white w-100 mt1">
      <div v-for="(series, index) in matching" :key="series.id" :id="series.id" :data-index="index" :class="`bb b--black-40 search-result ${index === selected ? 'selected' : ''}`" @mouseover="resultHover" @mousedown="resultPress">
        <img :src="series.image" :alt="series.name">
        <span class="truncate dib f6">{{series.name}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  const SERVER = process.env.NODE_ENV === 'production' ? 'https://umi-watch-api.now.sh' : 'http://localhost:3001'

  export default {
    name: 'search',
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
          e.preventDefault()
          this.selected -= 1
          if (this.selected < -1) {
            this.selected = this.matching.length - 1
          }
        } else if (e.which === 40) { // down
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
            const {data} = await axios.get(`${SERVER}/autocomplete/${this.country}`)
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
      resultPress ({target, which}) {
        if (which !== 1) return
        this.$router.push(`/series/${target.id}`)
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
