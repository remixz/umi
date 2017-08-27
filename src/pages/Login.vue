<template>
  <div class="relative overflow-hidden login-container">
    <div class="w-100 ph5 pv3 center absolute z-2">
      <h1 class="tc white f1 mb0">UMI!</h1>
      <h2 class="tc white fw5 mt1 mb2">The improved Crunchyroll player.</h2>
      <h3 class="tc white fw5 mt0">Watch together online, sync to MyAnimeList, and more.</h3>
      <form class="measure center bg-white shadow-2 br2 pa3" @submit.prevent="login">
        <span class="dark-red mb2 dib" v-if="formError">{{ formError }}</span>
        <legend class="f4 fw6 ph0 mt0 mb1">Sign in with Crunchyroll</legend>
        <fieldset class="ba b--transparent ph0 mh0 pb2">
          <div>
            <label class="db fw6 lh-copy f6 dark-gray" for="username">Username / Email</label>
            <input class="pa2 input-reset ba b--black-20 br1 bg-transparent w-100" type="text" name="username" v-model="username" required>
          </div>
          <div class="mv3">
            <label class="db fw6 lh-copy f6 dark-gray" for="password">Password</label>
            <input class="b pa2 input-reset ba b--black-20 br1 bg-transparent w-100" type="password" name="password" v-model="password" required>
          </div>
        </fieldset>
        <div>
          <input class="fw6 ph3 pv2 input-reset ba b--black-20 bg-white bg-animate hover-bg-blue black hover-white br1 pointer f6 dib w-100" type="submit" :value="loading ? 'Signing in...' : 'Sign in'">
        </div>
        <small class="pt3 db">
          <i class="fa fa-info-circle pr1" aria-hidden="true"></i> Your password is sent directly to Crunchyroll, and is never stored by Umi.
          </small>
      </form>
    </div>
    <img class="absolute left-0 right-0 center umi-illustration" src="../assets/umi-login.png" alt="Illustration of the character Umi Sonoda">
  </div>
</template>

<script>
  export default {
    name: 'login',
    metaInfo: {
      title: 'Login'
    },
    data () {
      return {
        username: '',
        password: '',
        formError: '',
        loading: false
      }
    },
    methods: {
      async login () {
        const {username, password, $store, $router, $route} = this

        this.formError = null
        this.loading = true
        try {
          await $store.dispatch('login', {username, password})
          $router.replace($route.query.next || '/')
        } catch (err) {
          this.formError = typeof err.message === 'string' ? err.message : err.data.message
          this.loading = false
        }
      }
    }
  }
</script>

<style scoped>
  .login-container {
    height: 100vh;
    min-width: 600px;
    min-height: 965px;
    background: linear-gradient(to bottom, #357edd, #00449e);
  }

  @keyframes hover {
    0% {
      transform: translateY(0);
    }
    
    50% {
      transform: translateY(-15px);
    }

    100% {
      transform: translateY(0);
    }
  }

  .umi-illustration {
    top: 450px;
    animation: hover 4s ease-in-out infinite;
  }
</style>
