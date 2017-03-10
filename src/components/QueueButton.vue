<template>
  <div class="f6 fw6 dib ba b--black-20 bg-white bg-animate hover-bg-light-gray black br1 pointer ph2 pv1" @click="inQueue = !inQueue">{{inQueue ? 'Remove from queue' : 'Add to queue'}}</div>
</template>

<script>
  export default {
    name: 'queue-button',
    props: ['id'],
    computed: {
      inQueue: {
        get () {
          const {series} = this.$store.state
          return series[this.id] ? series[this.id].in_queue : false
        },
        set (val) {
          this.$store.dispatch('updateSeriesQueue', {
            id: this.id,
            queueStatus: val
          })
        }
      }
    }
  }
</script>
