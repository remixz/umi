<template>
  <div class="sans-serif" id="app">
    <umi-header v-if="routeName !== 'login'" />
    <div v-if="newDomain" class="fixed bottom-0 right-0 z-max bg-light-blue pa3 code shadow-1 br2 br--top br--left">
      <span>📢 <b>UPDATE:</b> umi.bruggie.com is now umi.party! 🎉</span>
      <span class="f6 fw5 dib ml1 ba b--black bg-transparent bg-animate hover-bg-blue hover-white br1 pointer ph2 pv1 tc" @click="newDomain = false">Close</span>
    </div>
    <router-view v-if="routeName === 'login'"></router-view>
    <main class="bg-white center pv1 ph3 mv3" v-else>
      <router-view v-if="loaded"></router-view>
      <div v-else-if="error">
        <img src="https://my.mixtape.moe/gazrbv.gif" class="fl pr3">
        <div class="pt5">
          <p class="lh-copy">
            <b>Something went wrong when contacting Crunchyroll.</b> This probably means it's the weekend and Crunchyroll's servers can't handle the load. Try waiting for a few seconds and refreshing.
          </p>
          <button @click="refresh" class="fw6 ph6 pv2 input-reset ba b--black-20 bg-white bg-animate hover-bg-blue black hover-white br1 pointer f6 db center">Refresh</button>
        </div>
      </div>
      <div class="center tc" v-else>
        <i class="fa fa-circle-o-notch fa-spin fa-3x silver mt5"></i>
      </div>
    </main>
    <footer class="mw8 center relative">
      <p class="gray">
        This site is not endorsed by or affiliated with Crunchyroll. <br />
        Created by <a href="https://twitter.com/zachbruggeman" target="_blank" rel="noopener">Zach Bruggeman</a>. <a href="https://github.com/remixz/umi" target="_blank" rel="noopener">View source on GitHub</a>. <br />
      </p>
    </footer>
    <div v-if="updateAvailable" class="fixed left-0 right-0 bottom-0 bg-light-yellow pa3 fw6 br1 shadow-1 tc">
      <span>An update is ready to be installed.</span>
      <span class="f6 fw5 dib ml1 ba b--black bg-transparent bg-animate hover-bg-black hover-light-yellow br1 pointer ph2 pv1 tc" @click="refresh">Install and refresh</span>
    </div>
    <div v-if="stateError" class="fixed right-0 left-0 bottom-0 bg-light-red pa3 fw6 br1 shadow-1 tc">
      <span>Something went wrong when contacting Crunchyroll.</span>
      <span class="f6 fw5 dib ml1 ba b--black bg-transparent bg-animate hover-bg-black hover-light-red br1 pointer ph2 pv1 tc" @click="dismissError">Dismiss</span>
      <span class="f6 fw5 dib ml1 ba b--black bg-transparent bg-animate hover-bg-black hover-light-red br1 pointer ph2 pv1 tc" @click="refresh">Refresh</span>
    </div>
    <div class="fixed absolute--fill z-4" :class="[lights ? 'bg-black-90' : 'dn']"></div>
  </div>
</template>

<script>
import Header from 'components/Header'

export default {
  name: 'app',
  components: { 'umi-header': Header },
  data () {
    return {
      loaded: false,
      error: false,
      newDomain: false
    }
  },
  metaInfo () {
    return {
      titleTemplate: '%s - Umi',
      title: this.error ? 'Error' : 'Loading...'
    }
  },
  computed: {
    connected () {
      return this.$store.state.roomConnected
    },
    room () {
      return this.$store.state.roomId
    },
    routeName () {
      return this.$route.name
    },
    lights () {
      return this.$store.state.lights
    },
    updateAvailable () {
      return this.$store.state.updateAvailable
    },
    stateError () {
      return this.$store.state.error
    }
  },
  methods: {
    wsOnJoin () {
      this.$store.commit('UPDATE_CONNECTED_COUNT', this.$store.state.connectedCount + 1)
      this.$socket.emit('update-status', {
        name: this.$route.name
      })
    },
    wsOnChange (path) {
      if (this.room !== '' && path !== this.$route.path) {
        this.$router.push({path, query: this.$route.query})
      }
    },
    refresh () {
      location.reload()
    },
    dismissError () {
      this.$store.commit('SET_ERROR', false)
    }
  },
  watch: {
    routeName (curr, prev) {
      if (this.room !== '') {
        if (prev === 'media' && curr !== 'media') {
          this.$socket.on('user-joined', this.wsOnJoin)
        } else {
          this.$socket.off('user-joined', this.wsOnJoin)
        }
      }
    },
    room () {
      if (this.room !== '') {
        this.$socket.on('change', this.wsOnChange)
        if (this.$route.name !== 'media') {
          this.$socket.on('user-joined', this.wsOnJoin)
        }
      }
    },
    connected (curr) {
      if (!curr) {
        this.$socket.off('change', this.wsOnChange)
      }
    }
  },
  async created () {
    try {
      if (process.env.NODE_ENV === 'production' && location.hostname === 'umi.bruggie.com' && location.pathname !== '/migrate') {
        if (localStorage.getItem('migrated') || !localStorage.getItem('umi-uuid')) return location.replace(location.href.replace('umi.bruggie.com', 'umi.party'))

        const obj = {}
        Object.keys(localStorage).forEach((key) => {
          obj[key] = localStorage.getItem(key)
        })
        const query = encodeURIComponent(JSON.stringify(obj))
        localStorage.setItem('migrated', true)
        return location.replace(`https://umi.party/migrate?info=${query}&route=${encodeURIComponent(this.$route.fullPath)}`)
      }

      // accidentally broke migration, so volume would be set as the string `undefined`
      // this breaks the player, so i'll check for it here before the app mounts
      const volume = localStorage.getItem('clappr.umi.party.volume')
      if (volume && volume === 'undefined') {
        localStorage.setItem('clappr.umi.party.volume', '100')
      }

      await this.$store.dispatch('startSession')
      this.loaded = true
    } catch (err) {
      this.error = true
    }
  },
  mounted () {
    if (process.env.NODE_ENV === 'production') {
      const runtime = require('offline-plugin/runtime')
      this.$socket.on('app-update', () => {
        runtime.update()
      })

      if (localStorage.getItem('new-domain')) {
        this.newDomain = true
        localStorage.removeItem('new-domain')
      }
    }
  }
}
</script>

<style src="./App.css" />

<style scoped>
  main {
    width: 64rem;
    min-height: calc(100vh - 5rem);
    margin-top: 77px;
  }
</style>
