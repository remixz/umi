<template>
  <div class="sans-serif" id="app">
    <div :class="`${lights ? 'bg-dark-gray' : 'bg-green'} white pa2 cf z-5 fixed right-0 bottom-0 br1 br--left br--top shadow-1 room-bar ${roomBarClass}`">
      <div class="w-80 dib ph3">
        <i :class="`fa fa-caret-${hideBar ? 'left' : 'right'} absolute pointer bar-caret`" aria-hidden="true" @click="hideBar = !hideBar"></i>
        <input type="text" :class="`w-100 ${lights ? 'bg-near-black' : 'bg-dark-green'} white input-reset bw0 pa2 br1 pointer`" readonly v-tooltip.top-center="tooltip" v-model="roomUrl" @mouseenter="tooltip = 'Click to copy URL'" @click="handleRoomClick" @mouseleave="handleRoomInputLeave">
      </div>
      <div class="w-20 fr">
        <span :class="`f6 fw5 db ba b--white-40 bg-transparent bg-animate ${!lights ? 'hover-bg-dark-green' : ''} white br1 pointer ph2 pv1 tc`" style="margin-top: -3px" @click="handleDestroy">Leave this room</span>
        <span class="small-caps f6 absolute" style="right: 35px">Connected: {{connectedCount}}</span>
      </div>
    </div>
    <umi-header />
    <main class="bg-white center pv1 ph3 mv3" style="margin-top: 77px;">
      <transition name="fade" mode="out-in">
        <router-view v-if="!loading"></router-view>
        <div class="center tc" v-else>
          <i class="fa fa-circle-o-notch fa-spin fa-3x silver mt5"></i>
        </div>
      </transition>
    </main>
    <footer class="mw8 center relative">
      <p class="gray">
        This site is not endorsed by or affiliated with Crunchyroll. <br />
        Created by <a href="https://twitter.com/zachbruggeman" target="_blank" rel="noopener">Zach Bruggeman</a>. <a href="https://github.com/remixz/umi" target="_blank" rel="noopener">View source on GitHub</a>. <br />
        Dashboard icons made by <a href="http://www.flaticon.com/authors/popcorns-arts" target="_blank" rel="noopener">Popcorns Arts</a> from <a href="http://www.flaticon.com" target="_blank" rel="noopener">www.flaticon.com</a>. Licensed under <a href="http://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC 3.0 BY</a>.
      </p>
    </footer>
    <div v-if="updateAvailable" class="fixed left-0 bottom-0 bg-yellow pa3 fw6 br1 shadow-1">
      <span>An update is ready to be installed:</span>
      <span class="f6 fw5 dib ml1 ba b--black bg-transparent bg-animate hover-bg-black hover-yellow br1 pointer ph2 pv1 tc" @click="refresh">Install and refresh</span>
    </div>
    <div :class="`fixed absolute--fill z-4 ${lights ? 'bg-black-90' : 'dn'}`"></div>
  </div>
</template>

<script>
import Header from 'components/Header'

export default {
  name: 'app',
  components: { 'umi-header': Header },
  data () {
    return {
      loading: true,
      tooltip: 'Click to copy URL',
      hideBar: false
    }
  },
  metaInfo: {
    titleTemplate: '%s - Umi',
    title: 'Loading...'
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
  async beforeMount () {
    await this.$store.dispatch('startSession')
    this.loading = false
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
