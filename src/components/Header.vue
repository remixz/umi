<template>
  <header :class="`bg-blue absolute top-0 w-100 ${lights ? 'z-3' : 'z-max'}`">
    <div class="header-container center relative">
      <div class="logo-container">
        <router-link to="/" class="db no-underline">
          <img src="../assets/umi.png" alt="Umi player logo" class="logo db">
          <span class="b db ttu white f3 logo-text">Umi!</span>
        </router-link>
      </div>
      <div v-if="username">
        <div class="absolute nav" style="left: 95px; top: 14px;">
          <router-link exact to="/" class="white no-underline bg-animate"><i class="fa fa-th-list v-mid mr2" aria-hidden="true"></i> Queue</router-link>
          <router-link to="/history" class="white no-underline bg-animate"><i class="fa fa-history v-mid mr2" aria-hidden="true"></i> History</router-link>
        </div>
        <div class="absolute search right-0" style="top: 6px;">
          <form @submit.prevent="search" class="dib">
            <input type="text" class="br2 br--left input-reset white bw0 search-bar" placeholder="Search Crunchyroll" v-model="searchInput">
            <button class="br2 br--right pointer bw0 button-reset search-btn"><i class="fa fa-search white"></i></button>
          </form>
          <span class="f6 fw5 dib ml1 ba b--white-40 bg-transparent bg-animate white br1 pointer ph2 pv1 tc logout" @click="logout">Log out</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'umi-header',
  computed: {
    username () {
      return this.$store.state.auth.username
    },
    lights () {
      return this.$store.state.lights
    },
    searchInput: {
      get () {
        return this.$store.state.searchQuery
      },
      set (value) {
        this.$store.commit('SET_SEARCH_QUERY', value)
      }
    }
  },
  methods: {
    search () {
      if (this.searchInput.trim() === '') return
      const method = this.$route.name === 'search' ? 'replace' : 'push'
      this.$router[method](`/search?q=${this.searchInput}`)
    },
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
    margin-top: 9px;
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
    height: 64px;
    display: inline-block;
    margin-right: -5px;
    position: relative;
    top: -23px;
    padding: 1.4rem 1rem;
    border-bottom: 0.25rem solid #357edd;
    transition: all 0.2s ease-in-out;
  }

  .nav a:hover {
    border-bottom: 0.25rem solid #2c60a2;
  }

  .nav .fa {
    font-size: 1.25rem;
  }

  .nav .router-link-active {
    border-bottom: 0.25rem solid #2c60a2;
  }

  .search-bar {
    background-color: #2c60a2;
    padding: 0.5rem;
  }

  .search-bar::placeholder {
    color: white;
    opacity: 0.8;
  }

  .search-btn {
    background-color: #2c60a2;
    padding: 0.5rem;
    margin-left: -5px;
  }

  .search-bar:focus, .search-btn:active, .search-btn:focus {
    outline: none;
  }

  .logout:hover {
    background-color: #2c60a2;
  }
</style>
