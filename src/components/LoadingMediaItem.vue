<template>
  <div class="loading-media-item dib v-top h-100 bg-near-white mr3 mb2 pa2 bb bw2 b--light-gray">
    <div class="animated-background">
      <div class="bg-near-white absolute mask vid-sep"></div>
      <div class="bg-near-white absolute mask right-block"></div>
      <div class="bg-near-white absolute mask line-block-1"></div>
      <div class="bg-near-white absolute mask line-block-2"></div>
    </div>
  </div>
</template>

<style>
  @keyframes history-shimmer {
    0% {
        background-position: -992px 0
    }
    100% {
        background-position: 992px 0
    }
  }
</style>

<style scoped>
  .loading-media-item {
    width: 300px;
    height: 221px;
  }

  .animated-background {
    animation: history-shimmer 1.25s linear infinite;
    background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
    background-size: 2000px 104px;
    height: 208px;
    position: relative;
  }

  .mask.vid-sep {
    top: 155px;
    height: 10px;
    width: 280px;
  }

  .mask.line-block-1 {
    top: 180px;
    height: 5px;
    width: 280px;
  }

  .mask.line-block-2 {
    top: 205px;
    height: 3px;
    width: 280px;
  }

  .mask.left-block {
    top: 155px;
    left: 0;
    height: 66px;
    width: 10px;
  }

  .mask.right-block {
    top: 155px;
    right: 0;
    height: 54px;
    width: 80px;
  }
</style>
