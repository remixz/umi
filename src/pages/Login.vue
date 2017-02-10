<template>
  <div class="cf">
    <div class="w-50 fl">
      <h2>Umi: The better Crunchyroll player!</h2>
      <h3>Features:</h3>
      <ul>
        <li>Watch anime together with anyone across the internet in real time</li>
        <li>Full HTML5 support, including quality selection, history saving, and Chromecast support</li>
        <li>Blazing fast loading times</li>
      </ul>
      <p>
        Get started by logging into your Crunchyroll Premium account.
      </p>
      <p class="gray">This site communicates directly with the Crunchyroll servers, so your account information is 100% safe. You can <a href="https://github.com/remixz/umi/blob/master/src/lib/api.js" target="_blank">view</a> <a href="https://github.com/remixz/umi/blob/master/src/store/index.js#L56-L80" target="_blank">the</a> <a href="https://github.com/remixz/umi/blob/master/src/pages/Login.vue" target="_blank">code</a> to confirm that I'm not lying. 😄</p>
    </div>
    <div class="w-50 fl">
      <form class="measure center mt4" @submit.prevent="login">
        <fieldset id="sign_up" class="ba b--transparent ph0 mh0">
          <legend class="f4 fw6 ph0 mh0">Sign In</legend>
          <p v-if="formError">{{ formError }}</p>
          <p v-if="loading">Logging in...</p>
          <div class="mt3">
            <label class="db fw6 lh-copy f6 dark-gray" for="username">Username / Email</label>
            <input class="pa2 input-reset ba bg-transparent w-100" type="text" name="username" v-model="username" required>
          </div>
          <div class="mv3">
            <label class="db fw6 lh-copy f6 dark-gray" for="password">Password</label>
            <input class="b pa2 input-reset ba bg-transparent w-100" type="password" name="password" v-model="password" required>
          </div>
        </fieldset>
        <div>
          <input class="b ph3 pv2 input-reset bg-blue white bw0 pointer f6 dib" type="submit" value="Sign in">
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'login',
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
          this.formError = typeof err === 'string' ? err : err.data.message
          this.loading = false
        }
      }
    }
  }
</script>
