<template>
  <div class="overflow-x-scroll nowrap ph1">
    <media-item v-for="id in ids" :key="id" :id="id" :data-id="id" :selected="id === selected" size="small" />
  </div>
</template>

<script>
  import MediaItem from 'components/MediaItem'

  export default {
    props: ['ids', 'selected'],
    components: {
      MediaItem
    },
    mounted () {
      if (this.selected) {
        const item = this.$el.querySelector(`[data-id="${this.selected}"]`)
        const bounds = item.getBoundingClientRect()
        this.$el.scrollLeft = bounds.left - this.$el.offsetWidth
        if (this.$el.scrollLeft > this.$el.offsetWidth) {
          this.$el.scrollLeft = this.$el.scrollLeft + 250
        }
      }
    }
  }
</script>
