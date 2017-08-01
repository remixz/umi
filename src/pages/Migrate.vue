<template>
  <div class="center tc">
    <i class="fa fa-circle-o-notch fa-spin fa-3x silver mt5"></i>
  </div>
</template>

<script>
  export default {
    mounted () {
      const {info, route} = this.$route.query
      if (!info) return this.$router.replace('/')

      try {
        const parsed = JSON.parse(info)

        Object.keys(parsed).forEach((key) => {
          if (key.contains('clappr')) {
            key = key.replace('umi.bruggie.com', 'umi.party')
          }

          localStorage.setItem(key, parsed[key])
        })

        location.replace(route || '/')
      } catch (err) {
        location.replace('/')
      }
    }
  }
</script>
