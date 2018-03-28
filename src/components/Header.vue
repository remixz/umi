<template>
  <header class="fixed top-0 w-100" :class="[lights ? 'z-3' : 'z-max', {'alt-header': routeName === 'series' || routeName === 'media', 'box-shadow-umi': routeName !== 'media', 'tall-header': !readExtension}]">
    <div class="w-100 bg-light-green fw6 pa2 umi-border" v-if="!readExtension">
      <div class="header-container center">
        Please install the helper extension for <a target="_blank" class="black" href="https://chrome.google.com/webstore/detail/umi-enabler/ebpgknlgpomojokdkpgphjigniicjcgc">Chrome</a> or <a target="_blank" class="black" href="https://addons.mozilla.org/en-US/firefox/addon/umi-enabler/">Firefox</a> if an episode fails to load. Download links are also available in the menu.
        <div class="fr" @click="$store.commit('SET_READ_EXTENSION')">
          <i class="fa fa-close pointer grow" aria-hidden="true"></i>
        </div>
      </div>
    </div>
    <div class="header-container center relative">
      <div class="logo-container">
        <router-link to="/" class="db no-underline" exact>
          <img src="../assets/umi.png" alt="Umi player logo" class="logo db">
          <span class="b db ttu blue f3 logo-text">Umi!</span>
        </router-link>
      </div>
      <div>
        <div class="absolute nav">
          <router-link to="/queue" class="dark-gray no-underline">
            <i class="fa fa-th-list v-mid mr2" aria-hidden="true"></i>
            <span class="fw6">Queue</span>
          </router-link>
          <router-link to="/history" class="dark-gray no-underline">
            <i class="fa fa-history v-mid mr2" aria-hidden="true"></i>
            <span class="fw6">History</span>
          </router-link>
          <!-- <router-link to="/future-of-umi" class="dark-gray no-underline relative">
            <i class="fa fa-paper-plane-o v-mid mr2" aria-hidden="true"></i>
            <span class="fw6">The Future of Umi</span>
          </router-link> -->
        </div>
        <div class="absolute search right-0">
          <span class="fa-stack dib pointer" @click="showTogether" v-if="room !== ''" @mouseover="roomHover = true" @mouseout="roomHover = false">
            <i class="fa fa-circle fa-stack-2x transparent link menu-circle" :class="{active: roomMenu}"></i>
            <i class="fa fa-users fa-stack-1x dark-gray pointer-events-none"></i>
          </span>
          <span class="relative fl bg-dark-gray white pa1 tc br2 f7 fw7 nowrap counter" v-if="room !== ''">{{connectedCount}}</span>
          <div v-if="roomMenu" v-on-clickaway="hideTogether" class="absolute bg-white shadow-1 br2 pv2 ph3 together-menu">
            <div class="mb2 cf">
              <div class="fw6 fl">{{roomText}}</div>
              <div class="fr" v-if="isRoomHost">
                <input type="checkbox" id="hostOnly" v-model="roomHostOnly">
                <label for="hostOnly" v-tooltip.bottom-center="'Enabling this makes it so only you (the host) can control the player. '">Host-only mode <i class="fa fa-question-circle-o black-60" aria-hidden="true"></i></label>
              </div>
            </div>
            <input type="text" class="pa2 w-100 pointer" v-model="roomUrl" @click="handleRoomClick" readonly v-if="connected">
            <input type="text" class="pa2 w-100 i" value="Connecting..." readonly v-else>
            <button @click="leaveRoom" class="f6 mt2 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br2 box-shadow-umi pointer ph3 pv2 tc leave-room">Leave room</button>
            <button @click="hideTogether" class="f6 mt2 fw6 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br2 box-shadow-umi pointer ph3 pv2 tc w-15 fr">Close</button>
          </div>
          <search />
          <span class="fa-stack dib pointer" @click="showMenu">
            <i class="fa fa-circle fa-stack-2x transparent link menu-circle" :class="{active: menu}"></i>
            <i class="fa fa-ellipsis-v fa-stack-1x dark-gray pointer-events-none"></i>
          </span>
          <div v-if="menu" v-on-clickaway="hideMenu" class="absolute bg-white shadow-1 right-0 br2 pv2 menu">
            <div class="pv2 mh2 fw6 bb mb2 b--gray">
              <div class="db">
                <svg class="v-mid mr1" xmlns="http://www.w3.org/2000/svg" width="34" height="25" viewBox="0 0 250.9 278.8"><g fill="#f78b24"><path d="M115.4 209.8c-3.6-.3-13-2-16.3-2.8-29-7.7-55-28-68-55.4-7-15-10-28.4-10-45.6 0-17 3-30.8 10.6-45.5C36 49.5 42 41 51 32 67.4 16 88.3 5.8 112 2.7c7.8-1 24.2-.7 31.4.6 15 2.8 28.6 8 40.7 16.2 26 16.8 42 42.5 46 71.8 1 6.3 2 19.5 1 20.5l-.2-2.6c-1-12.7-6.5-28.2-14.2-40C192.6 34 149 19 109 32.5 77.8 42.8 54 69 47.8 101c-3 15.6-2 31 3 46.2 9 27 30 48.3 57.3 57.6 7 2.2 15 4 20 4.5 7 .6 5 1-3 1-4 0-9 0-9-.2z"/><path d="M137.7 196.8c-33.6-2.4-61.4-27.5-67.2-60.5-1-6-1.3-17.2-.5-22.7 5-33 30.3-57.8 63.3-62.4 6.7-1 18.6-.6 25 .7 5.5 1 11.7 3 16.5 5l3.8 1-3.6 2c-12.7 6-20.6 20-18.7 33.5 1.8 13.4 11.2 24 24.6 28 4 1.2 12 1.2 17 0 6-2 11-4.8 15-9.4 1-1.5 3-2.6 3-2.5l1 5c0 6 0 17-1 23-4 17.7-14 33-28 44-14 10.5-33 16-51 14.4z"/></g></svg>
                <span>{{username}}</span>
              </div>
              <a :href="`https://myanimelist.net/profile/${malUsername}`" target="_blank" rel="noopener" v-if="malUsername" class="mv2 db black no-underline">
                <span class="mal-icon mr1"></span>
                <span>{{malUsername}}</span>
              </a>
            </div>
            <a @click="hideMenu" href="https://chrome.google.com/webstore/detail/umi-enabler/ebpgknlgpomojokdkpgphjigniicjcgc" target="_blank" class="db bg-white bg-animate hover-bg-light-gray pa2 no-underline black">
              <i class="fa fa-chrome mr1" aria-hidden="true"></i> Chrome extension
            </a>
            <a @click="hideMenu" href="https://addons.mozilla.org/en-US/firefox/addon/umi-enabler/" target="_blank" class="db bg-white bg-animate hover-bg-light-gray pa2 no-underline black">
              <i class="fa fa-firefox mr1" aria-hidden="true"></i> Firefox extension
            </a>
            <div class="pb2 mh2 bb mb2 b--gray"></div>
            <router-link @click.native="hideMenu" to="/settings" class="db bg-white bg-animate hover-bg-light-gray pa2 no-underline black">
              <i class="fa fa-cog mr1"></i> Settings
            </router-link>
            <router-link @click.native="hideMenu" to="/changelog" class="db bg-white bg-animate hover-bg-light-gray pa2 no-underline black">
              <i class="fa fa-plus-square mr1"></i> Changelog
            </router-link>
            <div @click="logout" class="pointer bg-white bg-animate hover-bg-light-gray pa2">
              <i class="fa fa-sign-out mr1"></i> Sign out
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import Search from './Search'

export default {
  name: 'umi-header',
  components: { Search },
  mixins: [ clickaway ],
  data () {
    return {
      menu: false,
      roomText: 'Click to copy URL:',
      roomHover: false
    }
  },
  computed: {
    username () {
      return this.$store.state.auth.username
    },
    malUsername () {
      return this.$store.state.malAuth.username
    },
    lights () {
      return this.$store.state.lights
    },
    connected () {
      return this.$store.state.roomConnected
    },
    connectedCount () {
      const count = this.$store.state.connectedCount
      return (this.roomHover || this.roomMenu) ? `${count} ${count === 1 ? 'person' : 'people'} connected` : count
    },
    room () {
      return this.$store.state.roomId
    },
    roomUrl () {
      return `${window.location.origin}/room/${this.room.replace('umi//', '')}`
    },
    isRoomHost () {
      return this.$store.getters.isRoomHost
    },
    roomHostOnly: {
      get () {
        return this.$store.state.roomData.hostOnly
      },
      set (val) {
        this.$store.dispatch('updateRoomData', {hostOnly: val})
      }
    },
    roomMenu: {
      get () {
        return this.$store.state.roomMenu
      },
      set (val) {
        this.$store.commit('UPDATE_ROOM_MENU', val)
      }
    },
    routeName () {
      return this.$store.state.route.name
    },
    readExtension () {
      return this.$store.state.readExtension
    }
  },
  methods: {
    async logout () {
      this.menu = false
      await this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    showMenu () {
      this.menu = true
    },
    hideMenu () {
      this.menu = false
    },
    showTogether () {
      this.roomMenu = true
    },
    hideTogether () {
      this.roomMenu = false
      this.roomText = 'Click to copy URL:'
    },
    handleRoomClick ({target}) {
      target.select()
      const didCopy = document.execCommand('copy')
      if (didCopy) {
        this.roomText = 'Copied!'
      } else {
        this.roomText = 'Couldn\'t copy, press ctrl-c'
      }
    },
    leaveRoom () {
      this.$store.commit('UPDATE_CONNECTED', false)
      this.$store.dispatch('leaveRoom')
      this.hideTogether()
    }
  }
}
</script>

<style scoped>
  header {
    background-color: rgba(245, 245, 245, 0.95);
    height: 4rem;
    border-top: 2px solid #357edd;
    transform: translateZ(0); /* hack fix for 1px jitter when a transform happens on the page */
  }

  .tall-header {
    height: 6.1rem;
    border-top: 0;
  }

  .umi-border {
    border-bottom: 2px solid #357edd;
  }

  .header-container {
    width: 1024px;
  }

  .logo-container {
    width: 64px;
    height: 55px;
    margin-top: 7px;
  }

  .logo-container > a {
    width: 107px;
    height: 55px;
  }

  .logo {
    width: 64px;
    height: 55px;
    transform: translate(0, 0);
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .logo-text {
    transform: translate(0, -39px) rotate(10deg);
    opacity: 0;
    user-select: none;
    pointer-events: none;
    cursor: default;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .logo-container:hover .logo, .router-link-active .logo {
    transform: translate(-35px, 0);
  }

  .logo-container:hover .logo-text, .router-link-active .logo-text {
    opacity: 1;
    transform: translate(35px, -39px) rotate(10deg);
  }

  .logo-container:active .logo-text {
    transform: translate(35px, -36px) rotate(10deg);
  }

  .nav {
    left: 95px;
    top: 14px;
  }

  .nav a {
    height: 62px;
    display: inline-block;
    margin-right: -5px;
    position: relative;
    top: -21px;
    padding: 1.4rem 1rem;
    transition: all 0.2s ease-in-out;
    border-bottom: 0 solid transparent;
  }

  .nav a:hover, .nav .router-link-active {
    border-bottom: .25rem solid #357edd;
  }

  .nav .fa {
    font-size: 1.25rem;
  }

  .search {
    top: 8px;
  }

  .menu-circle:hover, .menu-circle.active {
    color: #e3e3e3;
  }

  .menu, .together-menu {
    top: 45px;
    width: 200px;
  }

  .together-menu {
    right: 281px;
    width: 500px;
  }

  .menu:after, .together-menu:after {
    bottom: 100%;
    right: 9px;
    border: solid transparent;
    content: "";
    width: 0;
    height: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(255, 255, 255, 0);
    border-bottom-color: #fff;
    border-width: 8px;
    margin-left: -8px;
  }

  .leave-room {
    width: 83%;
  }

  .counter {
    top: 9px;
    right: 5px;
    min-width: 7px;
    height: 13px;
  }

  .counter:after {
    left: 100%;
    top: 50%;
    border: solid transparent;
    content: "";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-left-color: #333;
    border-width: 4px;
    margin-top: -4px;
  }

  /* styles on an alt page (series & media) */
  .alt-header {
    background-color: rgba(0, 0, 0, 0.4);
    border-top-color: transparent;
  }

  .alt-header .bg-blue {
    background-color: transparent;
  }

  .alt-header .dark-gray, .alt-header .blue {
    color: #fff;
  }

  .alt-header .white {
    color: transparent;
  }

  .alt-header .bg-dark-blue {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .alt-header .counter:after {
    border-left-color: rgba(0, 0, 0, 0.2);
  }

  .alt-header .menu-circle:hover, .alt-header .menu-circle.active {
    color: transparent;
  }

  .alt-header .counter, .media-header .counter {
    background-color: #fff;
    color: #333;
  }

  .alt-header .counter:after, .media-header .counter:after {
    border-left-color: #fff;
  }

  .alt-header .nav a:hover, .alt-header .nav .router-link-active {
    border-bottom: .25rem solid #fff;
  }
</style>
