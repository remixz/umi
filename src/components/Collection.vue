<template>
  <div>
    <media-item v-for="id in media" :key="id" :id="id" :seriesId="seriesId" size="medium" />
  </div>
</template>

<script>
  import MediaItem from 'components/MediaItem'

  export default {
    name: 'collection',
    props: ['id', 'seriesId'],
    components: {
      'media-item': MediaItem
    },
    computed: {
      media () {
        const {$store, id} = this
        return $store.state.collectionMedia[id]
      }
    },
    async beforeMount () {
      await this.$store.dispatch('getMediaForCollection', this.id)
    }
  }
</script>
