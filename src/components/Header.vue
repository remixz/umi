<template>
  <header :class="`bg-blue absolute top-0 w-100 bw1 bb b--dark-blue ${lights ? 'z-3' : 'z-max'}`">
    <div class="header-container center relative">
      <div class="logo-container">
        <router-link to="/" class="db no-underline">
          <img src="../assets/umi.png" alt="Umi player logo" class="logo db">
          <span class="b db ttu white f3 logo-text">Umi!</span>
        </router-link>
      </div>
      <div v-if="username">
        <div class="absolute nav" style="left: 95px; top: 16px;">
          <router-link exact to="/" class="white no-underline bg-animate">
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
          <span class="f6 fw5 dib ml1 ba b--light-blue bg-transparent bg-animate white br1 pointer ph2 pv1 tc logout" @click="logout">Log out</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import Search from './Search'

export default {
  name: 'umi-header',
  components: { Search },
  computed: {
    username () {
      return this.$store.state.auth.username
    },
    lights () {
      return this.$store.state.lights
    }
  },
  methods: {
    async logout () {
      await this.$store.dispatch('logout')
      this.$router.push('/login')
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
</style>
