<template>
  <div id="app">
    <umi-header v-if="routeName !== 'login'" />
    <div class="fixed top-0 right-0 left-0 center tc pa3 z-max fw6 bg-yellow box-shadow-umi guest-message" :class="{active: guestMessage}">
      You can't leave the player as a guest while in a room that's controlled by the host.
    </div>
    <div class="fixed top-1 right-1 z-max" v-if="routeName !== 'login'">
      <div v-if="updated" class="bg-white pa3 shadow-1 br2 notification success">
        <div class="mb3 fw6 tc"><span class="normal">✅</span> Umi has updated successfully!</div>
        <router-link to="/changelog" class="db f6 fw5 ml1 bg-white ba b--black-20 box-shadow-umi bg-animate hover-bg-light-gray br1 pointer ph2 pv1 tc mb2 black no-underline" @click.native="dismissUpdated">View changelog</router-link>
        <div class="db f6 fw5 ml1 bg-white ba b--black-20 box-shadow-umi bg-animate hover-bg-light-gray br1 pointer ph2 pv1 tc" @click="dismissUpdated">Dismiss</div>
      </div>
      <div v-if="stateError" class="bg-white pa3 shadow-1 br2 notification error">
        <div class="tc mb3 fw6"><span class="normal">❌</span> Something went wrong when contacting Crunchyroll.</div>
        <div class="f6 fw5 ml1 bg-white ba b--black-20 box-shadow-umi bg-animate hover-bg-light-gray br1 pointer ph2 pv1 tc mb2" @click="refresh">Refresh</div>
        <div class="f6 fw5 ml1 bg-white ba b--black-20 box-shadow-umi bg-animate hover-bg-light-gray br1 pointer ph2 pv1 tc" @click="dismissError">Dismiss</div>
      </div>
    </div>
    <router-view v-if="routeName === 'login'"></router-view>
    <main class="bg-white center pv1 ph3 mv3" :class="{'tall-offset': !readExtension}" v-else>
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
      updated: localStorage.getItem('updated') || false
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
    roomData () {
      return this.$store.state.roomData
    },
    routeName () {
      return this.$route.name
    },
    routePath () {
      return this.$route.path
    },
    lights () {
      return this.$store.state.lights
    },
    stateError () {
      return this.$store.state.error
    },
    guestMessage () {
      return this.$store.state.guestMessage
    },
    readExtension () {
      return this.$store.state.readExtension
    }
  },
  methods: {
    refresh () {
      location.reload()
    },
    dismissError () {
      this.$store.commit('SET_ERROR', false)
    },
    dismissUpdated () {
      this.updated = false
      localStorage.removeItem('updated')
    }
  },
  watch: {
    routePath () {
      if (this.room !== '') {
        this.$store.dispatch('updateRoomData', {
          route: {
            name: this.$route.name,
            path: this.$route.path
          }
        })
      }
    },
    roomData (curr, prev) {
      if (this.room !== '') {
        if (curr.route.name !== 'media') {
          this.$store.dispatch('updateRoomData', {
            playing: false
          })
        } else if (curr.route.path !== this.$route.path) {
          this.$router.push({path: curr.route.path})
        }
      }
    }
  },
  async created () {
    try {
      await this.$store.dispatch('startSession')

      if (
        this.$route.name !== 'login' &&
        this.$route.name !== 'future-of-umi' &&
        Object.keys(this.$store.state.auth).length > 0 &&
        (!this.$store.state.auth.token || !this.$store.state.auth.expires || new Date() > new Date(this.$store.state.auth.expires))
      ) {
        await this.$store.dispatch('logout', true)
        this.$router.replace(`/login?next=${encodeURIComponent(this.$route.fullPath)}`)
      }

      this.loaded = true
    } catch (err) {
      this.error = true
    }
  }
}
</script>

<style src="./App.css"></style>

<style scoped>
  main {
    width: 64rem;
    min-height: calc(100vh - 5rem);
    margin-top: 77px;
  }

  .tall-offset {
    margin-top: 100px;
  }

  .notification {
    width: 280px;
    margin-bottom: 1rem;
  }

  .notification.success {
    border-top: 2px solid #19a974;
  }

  .notification.error {
    border-top: 2px solid #ff4136;
  }

  .guest-message {
    transform: translateY(-50px);
    opacity: 0;
    transition: all 0.3s ease-in-out;
  }

  .guest-message.active {
    transform: translateY(0);
    opacity: 1;
  }
</style>
