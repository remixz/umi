<template>
  <div class="home-tabs">
    <router-link to="/" class="link" exact>
      <div class="w-50 fl bb bw1 b--dark-blue hover-bg-blue hover-white small-caps">
          <p class="tc">Queue</p>
      </div>
    </router-link>
    <router-link to="/history" class="link">
      <div class="w-50 fl bb bw1 b--dark-blue hover-bg-blue hover-white small-caps">
          <p class="tc">History</p>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
  .home-tabs {
    height: 51px;
  }

  .router-link-active > div {
    background-color: #357edd;
    color: white;
  }

  .router-link-active p {
    font-weight: 700;
  }
</style>
