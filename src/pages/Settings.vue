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
    <h2 class="fw5 bb pb2 b--dark-gray"><i class="fa fa-link mr1"></i> Connections</h2>
    <div class="cf">
      <div class="fl pv2">
        <span class="mal-icon mr1"></span>
        <span class="fw5">AniList</span>
        <span v-if="alAuth.name">({{alAuth.name}})</span>
      </div>
      <div class="fr" v-if="$route.hash !== ''">
        <span class="fw5">Authenticating...</span>
      </div>
      <div class="fr" v-else-if="!alAuth.name">
        <a class="link fw6 ph3 pv2 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br2 box-shadow-umi f6 dib" :href="anilistUrl">Sign in with AniList</a>
      </div>
      <div class="fr" v-else>
        <button @click="logoutAnilist" class="fw6 ph3 pv2 ba b--black-20 bg-white bg-animate hover-bg-light-gray black br2 box-shadow-umi pointer f6 dib">Sign out</button>
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
    async created () {
      if (this.$route.hash === '') return;
      const {access_token} = this.$route.hash
        .replace(/^#/, '')
        .split('&')
        .map((el) => el.split('='))
        .reduce((obj, val) => {
          obj[val[0]] = val[1]
          return obj
        }, {});

      if (!access_token) return;

      await this.$store.dispatch('authenticateAniList', {
        token: access_token
      })

      this.$router.replace('/settings')
    },
    computed: {
      malAuth () {
        return this.$store.state.malAuth
      },
      alAuth () {
        return this.$store.state.alAuth
      },
      locales () {
        return this.$store.state.locales
      },
      anilistUrl () {
        return `https://anilist.co/api/v2/oauth/authorize?client_id=${process.env.NODE_ENV === 'production' ? '1234' : '1235'}&response_type=token`
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
      },
      logoutAnilist () {
        this.$store.commit('REMOVE_AL_AUTH')
      }
    }
  }
</script>

<style scoped>
  .save-message {
    transition: opacity 0.15s ease-in-out;
  }
</style>
