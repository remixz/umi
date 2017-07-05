<template>
  <div class="sans-serif" id="app">
    <div class="white pa2 cf z-5 fixed right-0 bottom-0 br1 br--left br--top shadow-1 room-bar" :class="[lights ? 'bg-dark-gray' : 'bg-green', roomBarClass]">
      <div class="w-80 dib ph3">
        <i class="fa absolute pointer bar-caret" :class="[`fa-caret-${hideBar ? 'left' : 'right'}`]" aria-hidden="true" @click="hideBar = !hideBar"></i>
        <input type="text" class="w-100 white input-reset bw0 pa2 br1 pointer" :class="[lights ? 'bg-near-black' : 'bg-dark-green']" readonly v-tooltip.top-center="tooltip" v-model="roomUrl" @mouseenter="tooltip = 'Click to copy URL'" @click="handleRoomClick" @mouseleave="handleRoomInputLeave">
      </div>
      <div class="w-20 fr">
        <span class="f6 fw5 db ba b--white-40 bg-transparent bg-animate white br1 pointer ph2 pv1 tc" :class="{'hover-bg-dark-green': !lights}" style="margin-top: -3px" @click="handleDestroy">Leave this room</span>
        <span class="small-caps f6 absolute" style="right: 35px">Connected: {{connectedCount}}</span>
      </div>
    </div>
    <umi-header />
    <main class="bg-white center pv1 ph3 mv3">
      <router-view v-if="loaded"></router-view>
      <div v-else-if="error">
        <img src="https://my.mixtape.moe/gazrbv.gif" class="fl pr3">
        <div class="pt5">
          <p class="lh-copy">
            <b>Something went wrong when contacting Crunchyroll.</b> This probably means it's the weekend and Crunchyroll's servers can't handle the load. Try waiting for a seconds and refreshing.
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
      tooltip: 'Click to copy URL',
      hideBar: false
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
      return this.$route.name
    },
    lights () {
      return this.$store.state.lights
    },
    roomBarClass () {
      return !this.connected ? 'hidden' : (this.hideBar ? 'peek' : 'show')
    },
    updateAvailable () {
      return this.$store.state.updateAvailable
    },
    stateError () {
      return this.$store.state.error
    }
  },
  methods: {
    handleRoomClick ({target}) {
      target.select()
      const didCopy = document.execCommand('copy')
      if (didCopy) {
        this.tooltip = 'Copied!'
      } else {
        this.tooltip = 'Couldn\'t copy, press CTRL-C'
      }
    },
    handleRoomInputLeave ({target}) {
      target.blur()
    },
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
    handleDestroy () {
      this.$socket.off('change', this.wsOnChange)
      this.$store.commit('UPDATE_CONNECTED', false)
      this.$store.dispatch('leaveRoom')
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
    }
  },
  async created () {
    try {
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

  .room-bar {
    width: 724px;
    transition: transform 0.2s ease;
  }

  .room-bar.hidden {
    transform: translateY(55px);
  }

  .room-bar.peek {
    transform: translateX(700px);
  }

  .room-bar.peek:hover {
    transform: translateX(690px);
  }

  .room-bar.show {
    transform: translateX(0);
  }

  .bar-caret {
    padding: 10px;
    left: -2px;
    top: 3px;
    font-size: 26px;
  }

  .fade-enter-active, .fade-leave-active {
    transition: all .2s ease;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0;
  }
</style>
