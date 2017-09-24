<template>
  <div v-if="!hide">
    <div v-if="loading" class="center container-width">
      <loading-media-item v-for="n in 15" :key="n" />
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
      MediaItem,
      LoadingMediaItem
    },
    computed: {
      media () {
        const {$store, id} = this
        return $store.state.collectionMedia[id]
      },
      sortedMedia () {
        return this.media ? (
          this.sort === 'old' ? this.media : this.media.slice(0).reverse()
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
