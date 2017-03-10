<template>
  <div class="sans-serif" id="app">
    <div v-if="connected" :class="`${lights ? 'bg-dark-gray' : 'bg-green'} white pa2 cf z-5 absolute w-100 top-0`">
      <div class="w-80 dib ph3">
        <span><strong>Connected to room!</strong> Share this link:</span>
        <input type="text" :class="`w-60 ${lights ? 'bg-near-black' : 'bg-dark-green'} white input-reset bw0 pa2`" v-model="roomUrl" @click="handleRoomClick">
      </div>
      <div class="fr">
        <span class="underline pointer" @click="handleDestroy">Leave this room</span> <br>
        <span>Watching: {{connectedCount}}</span>
      </div>
    </div>
    <header :class="`bg-blue relative shadow-1 header${connected ? ' connected' : ''}`">
      <router-link class="no-underline white f3 dib tracked absolute bottom-0 left-2" to="/" title="Home">
        <img src="./assets/umi.png" alt="umi logo" class="logo">
        <span class="relative logo-text avenir ttu">umi</span>
      </router-link>
      <section class="center search-bar" v-if="username">
        <input type="text" class="w-100 bn pa3 f3 white search-input" placeholder="Search...." v-model="searchInput">
      </section>
      <section class="absolute right-1 top-1 username white f5" v-if="username">
        {{ username }} <br>
        <span class="underline pointer" @click="logout">Log out</span>
      </section>
    </header>

    <main class="bg-white center pv1 ph3 mv3 relative">
      <transition name="fade" mode="out-in">
        <home-tabs v-if="showTabs" />
      </transition>
      <transition name="fade" mode="out-in" v-if="!loading">
        <router-view></router-view>
      </transition>
    </main>

    <footer class="mw8 center relative">
      <a href="https://www.netlify.com" target="_blank" class="absolute right-0">
        <img src="https://www.netlify.com/img/global/badges/netlify-light.svg"/>
      </a>
      <p class="gray">
        This site is not endorsed by or affiliated with Crunchyroll. <br /> Created by <a href="https://twitter.com/zachbruggeman" target="_blank">Zach Bruggeman</a>. <a href="https://github.com/remixz/umi" target="_blank">View source on GitHub</a>.
      </p>
    </footer>

    <div :class="`fixed absolute--fill z-4 ${lights ? 'bg-black-90' : 'dn'}`"></div>
  </div>
</template>

<script>
import debounce from 'debounce'
import WS from 'lib/websocket'
import HomeTabs from 'components/HomeTabs'

export default {
  name: 'app',
  components: { HomeTabs },
  data () {
    return {
      loading: true
    }
  },
  metaInfo: {
    titleTemplate: '%s - Umi',
    title: 'Loading...'
  },
  computed: {
    username () {
      return this.$store.state.auth.username
    },
    searchInput: {
      get () {
        return this.$store.state.searchQuery
      },
      set (value) {
        this.$store.commit('SET_SEARCH_QUERY', value)
        this.goToSearch(this.searchInput, this.$route, this.$router)
      }
    },
    connected () {
      return this.$store.state.roomConnected
    },
    connectedCount () {
      return this.$store.state.connectedCount
    },
    room () {
      return this.$store.state.roomId
    },
    roomUrl () {
      return `${window.location.origin}/room/${this.room.replace('umi//', '')}`
    },
    routeName () {
      return this.$store.state.route.name
    },
    lights () {
      return this.$store.state.lights
    },
    showTabs () {
      return this.$route.name === 'home' || this.$route.name === 'history'
    }
  },
  methods: {
    handleRoomClick ({target}) {
      target.select()
    },
    goToSearch: debounce((input, route, router) => {
      const method = route.name === 'search' ? 'replace' : 'push'
      router[method](`/search?q=${input}`)
    }, 250),
    wsOnJoin () {
      this.$store.commit('UPDATE_CONNECTED_COUNT', this.$store.state.connectedCount + 1)
      WS.socket.emit('update-status', {
        name: this.$route.name
      })
    },
    wsOnChange (path) {
      if (this.room !== '' && path !== this.$route.path) {
        this.$router.push({path, query: this.$route.query})
      }
    },
    handleDestroy () {
      WS.socket.off('change', this.wsOnChange)
      this.$store.commit('UPDATE_CONNECTED', false)
      this.$store.dispatch('leaveRoom')
    },
    logout () {
      localStorage.removeItem('auth')
      location.pathname = '/'
    }
  },
  watch: {
    routeName (curr, prev) {
      if (this.room !== '') {
        if (prev === 'media' && curr !== 'media') {
          WS.socket.on('user-joined', this.wsOnJoin)
        } else {
          WS.socket.off('user-joined', this.wsOnJoin)
        }
      }
    },
    room () {
      if (this.room !== '') {
        WS.socket.on('change', this.wsOnChange)
        if (this.$route.name !== 'media') {
          WS.socket.on('user-joined', this.wsOnJoin)
        }
      }
    }
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

  .emoji {
    height: 28px;
    user-select: none;
  }

  .tooltip {
    display: none;
    opacity: 0;
    transition: opacity .15s;
    pointer-events: none;
    padding: 4px;
    z-index: 10000;
  }

  .tooltip .tooltip-content {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 5px 10px 4px;
  }

  .tooltip.tooltip-open-transitionend {
    display: block;
  }

  .tooltip.tooltip-after-open {
    opacity: 1;
  }

  .home-tabs-padding {
    padding-top: 30px;
  }
</style>

<style scoped>
  main {
    width: 64rem;
    min-height: calc(100vh - 5rem);
  }

  .header {
    width: 100%;
    height: 4rem;
  }

  .header.connected {
    margin-top: 52px;
  }

  .logo {
    width: 64px;
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

  .fade-enter-active, .fade-leave-active {
    transition: all .2s ease;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0;
  }
</style>
