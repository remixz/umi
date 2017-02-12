<template>
  <div v-if="!hide">
    <media-item v-for="id in sortedMedia" :key="id" :id="id" size="medium" />
  </div>
</template>

<script>
  import MediaItem from 'components/MediaItem'

  export default {
    name: 'collection',
    props: ['id', 'hide', 'sort'],
    components: {
      'media-item': MediaItem
    },
    computed: {
      media () {
        const {$store, id} = this
        return $store.state.collectionMedia[id]
      },
      sortedMedia () {
        return this.sort === 'old' ? this.media : Array.from(this.media).reverse()
      }
    },
    async beforeMount () {
      await this.$store.dispatch('getMediaForCollection', this.id)
    }
  }
</script>
