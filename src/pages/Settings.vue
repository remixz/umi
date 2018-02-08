<template>
  <div class="mt2">
    <h2 class="fw5 bb pb2 b--dark-gray"><i class="fa fa-user mr1"></i> Profile</h2>
    <div class="cf">
      <div class="fl mt2">
        <span class="fw5">Content language</span>
      </div>
      <div class="fr">
        <select name="locale" class="h2 br1 ba b--black-20 bg-white mt3" v-model="selectedLocale">
          <option v-for="locale in locales" :key="locale.locale_id" :value="locale.locale_id">{{locale.label}}</option>
        </select>
        <div class="green mt1 absolute save-message" :class="[savedLocale ? 'o-100' : 'o-0']">Saved!</div>
      </div>
    </div>
    <div class="cf">
      <div class="fl mt2">
        <span class="fw5">Dark theme</span>
      </div>
      <div class="fr">
        <input type="checkbox" v-model="darkTheme" /> {{darkTheme ? 'On' : 'Off'}}
      </div>
    </div>
    <h2 class="fw5 bb pb2 b--dark-gray"><i class="fa fa-link mr1"></i> Connections</h2>
    <div class="cf">
      <div class="fl pv2">
        <span class="mal-icon mr1"></span>
        <span class="fw5">MyAnimeList</span>
        <span v-if="malAuth.username">({{malAuth.username}})</span>
      </div>
      <form class="fr" @submit.prevent="loginMal" v-if="!malAuth.username">
        <input type="text" placeholder="Username" class="ph3 pv2 ba b--silver br2" required v-model="malUsername" />
        <input type="password" placeholder="Password" class="ph3 pv2 ba b--silver br2" required v-model="malPassword" />
        <input type="submit" :value="malLoading ? 'Loading...' : 'Sign in'" class="fw6 ph3 pv2 input-reset ba b--black-20 bg-white bg-animate hover-bg-light-gray black br2 box-shadow-umi pointer f6 dib">
        <div class="red mt1" v-if="malError">Invalid username/password</div>
      </form>
      <div class="fr" v-else>
        <button @click="logoutMal" class="fw6 ph3 pv2 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br2 box-shadow-umi pointer f6 dib">Sign out</button>
      </div>
    </div>
  </div>
</template>

<script>
  import {LOCALE} from 'lib/api'

  export default {
    name: 'settings',
    metaInfo: {
      title: 'Settings'
    },
    data () {
      return {
        malUsername: '',
        malPassword: '',
        malLoading: false,
        malError: false,
        savedLocale: false,
        selectedLocale: LOCALE()
      }
    },
    computed: {
      malAuth () {
        return this.$store.state.malAuth
      },
      locales () {
        return this.$store.state.locales
      },
      darkTheme: {
        get () {
          return this.$store.state.darkTheme
        },
        set (val) {
          this.$store.commit('SET_DARK_THEME', val)
        }
      }
    },
    watch: {
      selectedLocale (val) {
        localStorage.setItem('locale', val)
        if (this.savedLocale) return
        this.savedLocale = true
        setTimeout(() => {
          this.savedLocale = false
        }, 2000)
      }
    },
    methods: {
      async loginMal () {
        this.malError = false
        this.malLoading = true

        try {
          await this.$store.dispatch('authenticateMal', {
            username: this.malUsername,
            password: this.malPassword
          })
          this.malLoading = false
          this.malUsername = ''
          this.malPassword = ''
        } catch (err) {
          this.malLoading = false
          this.malError = true
        }
      },
      logoutMal () {
        this.$store.commit('REMOVE_MAL_AUTH')
      }
    }
  }
</script>

<style scoped>
  .save-message {
    transition: opacity 0.15s ease-in-out;
  }
</style>
