<template>
  <div>
    <h1> login </h1>
    <form @submit.prevent="login">
      <p v-if="formError">{{ formError }}</p>
      <p v-if="loading">Logging in...</p>
      <p>Username: <input type="text" v-model="username" name="username" required /></p>
      <p>Password: <input type="password" v-model="password" name="password" required /></p>
      <button type="submit">Login</button>
    </form>
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
          this.formError = err.data.message
          this.loading = false
        }
      }
    }
  }
</script>
