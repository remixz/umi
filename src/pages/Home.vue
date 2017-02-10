<template>
  <div>
    <home-tabs />
    <div class="mt4">
      <div v-if="data.length > 0">
        <queue-item v-for="d in data" :key="d.queue_entry_id" :data="d" />
      </div>
      <h2 v-else>loading</h2>
    </div>
  </div>
</template>

<script>
  import {authCheck} from 'lib/auth'
  import QueueItem from 'components/QueueItem'
  import HomeTabs from 'components/HomeTabs'

  export default {
    name: 'home',
    mixins: [authCheck],
    data () {
      return {
        data: []
      }
    },
    components: {
      'queue-item': QueueItem,
      'home-tabs': HomeTabs
    },
    async beforeMount () {
      const {$store} = this
      if (!$store.state.auth.username) return

      const data = await $store.dispatch('getQueueInfo')
      this.data = data
    }
  }
</script>
