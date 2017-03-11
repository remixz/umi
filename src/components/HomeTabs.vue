<template>
  <div class="home-tabs absolute top-0 left-0 w-100 bg-white">
    <router-link to="/" exact>
      <div class="w-50 fl bb bw1 b--dark-blue hover-bg-blue hover-white small-caps bg-animate">
          <p class="tc">Queue</p>
      </div>
    </router-link>
    <router-link to="/history">
      <div class="w-50 fl bb bw1 b--dark-blue hover-bg-blue hover-white small-caps bg-animate">
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
</style>
