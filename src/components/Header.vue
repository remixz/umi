<template>
  <header class="bg-blue absolute top-0 w-100 bw1 bb b--dark-blue" :class="[lights ? 'z-3' : 'z-max']">
    <div class="header-container center relative">
      <div class="logo-container">
        <router-link to="/" class="db no-underline">
          <img src="../assets/umi.png" alt="Umi player logo" class="logo db">
          <span class="b db ttu white f3 logo-text poppins">Umi!</span>
        </router-link>
      </div>
      <div v-if="username">
        <div class="absolute nav" style="left: 95px; top: 16px;">
          <router-link to="/queue" class="white no-underline bg-animate">
            <i class="fa fa-th-list v-mid mr2" aria-hidden="true"></i>
            <span class="fw6">Queue</span>
          </router-link>
          <router-link to="/history" class="white no-underline bg-animate">
            <i class="fa fa-history v-mid mr2" aria-hidden="true"></i>
            <span class="fw6">History</span>
          </router-link>
        </div>
        <div class="absolute search right-0" style="top: 8px;">
          <search />
          <span class="fa-stack dib pointer" @click="showMenu">
            <i class="fa fa-circle fa-stack-2x blue link menu-circle" :class="{active: menu}"></i>
            <i class="fa fa-ellipsis-v fa-stack-1x white" style="pointer-events: none"></i>
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
            <router-link @click.native="hideMenu" to="/settings" class="db pointer bg-white hover-bg-blue hover-white pa2 no-underline black">
              <i class="fa fa-cog mr1"></i> Settings
            </router-link>
            <div @click="logout" class="pointer bg-white hover-bg-blue hover-white pa2">
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
      menu: false
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
    }
  }
}
</script>

<style scoped>
  header {
    height: 4rem;
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

  .logo-container:hover .logo {
    transform: translate(-35px, 0);
  }

  .logo-container:hover .logo-text {
    opacity: 1;
    transform: translate(35px, -39px) rotate(10deg);
  }

  .logo-container:active .logo-text {
    transform: translate(35px, -36px) rotate(10deg);
  }

  .nav a {
    height: 62px;
    display: inline-block;
    margin-right: -5px;
    position: relative;
    top: -23px;
    padding: 1.4rem 1rem;
    border-bottom: 0 solid #00449e;
    transition: all 0.2s ease-in-out;
  }

  .nav a:hover {
    border-bottom-width: 0.25rem;
  }

  .nav .fa {
    font-size: 1.25rem;
  }

  .nav .router-link-active {
    border-bottom: 0.25rem solid #00449e;
  }
  .logout:hover {
    background-color: #00449e;
  }

  .menu-circle:hover, .menu-circle.active {
    color: #00449e;
  }

  .menu {
    top: 45px;
    width: 200px;
  }

  .menu:after {
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
</style>
