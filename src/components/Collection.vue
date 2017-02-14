<template>
  <div v-if="!hide">
    <div v-if="loading" style="width: 948px" class="center">
      <loading-media-item v-for="n in 15" />
    </div>
    <media-item v-else v-for="id in sortedMedia" :key="id" :id="id" size="medium" />
  </div>
</template>

<script>
  import MediaItem from 'components/MediaItem'
  import LoadingMediaItem from 'components/LoadingMediaItem'

  export default {
    name: 'collection',
    props: ['id', 'hide', 'sort'],
    data () {
      return {
        loading: true
      }
    },
    components: {
      'media-item': MediaItem,
      'loading-media-item': LoadingMediaItem
    },
    computed: {
      media () {
        const {$store, id} = this
        return $store.state.collectionMedia[id]
      },
      sortedMedia () {
        return this.media ? (
          this.sort === 'old' ? this.media : Array.from(this.media).reverse()
        ) : []
      }
    },
    watch: {
      async hide (val) {
        if (!val) {
          await this.$store.dispatch('getMediaForCollection', this.id)
          this.loading = false
        }
      }
    },
    async beforeMount () {
      if (!this.hide) {
        await this.$store.dispatch('getMediaForCollection', this.id)
        this.loading = false
      }
    }
  }
</script>
