<template>
  <div>
    <form class="measure center mt4" @submit.prevent="login">
      <fieldset class="ba b--transparent ph0 mh0 pb2">
        <legend class="f3 fw6 ph0 mh0">
          <span v-if="!loading && !formError">Sign In</span>
          <span v-if="loading">Signing in...</span>
          <span class="dark-red" v-if="formError">{{ formError }}</span>
        </legend>
        <div class="mt3">
          <label class="db fw6 lh-copy f6 dark-gray" for="username">Username / Email</label>
          <input class="pa2 input-reset ba b--black-20 br1 bg-transparent w-100" type="text" name="username" v-model="username" required>
        </div>
        <div class="mv3">
          <label class="db fw6 lh-copy f6 dark-gray" for="password">Password</label>
          <input class="b pa2 input-reset ba b--black-20 br1 bg-transparent w-100" type="password" name="password" v-model="password" required>
        </div>
      </fieldset>
      <div>
        <input class="fw6 ph3 pv2 input-reset ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer f6 dib w-100" type="submit" value="Sign in">
      </div>
      <img src="https://media.tenor.co/images/27f277a3ecf2e3cea170ed293f6d59f7/raw" class="mt3" alt="">
    </form>
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
    beforeMount () {
      if (this.$store.state.auth.username) {
        this.$router.replace('/')
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
