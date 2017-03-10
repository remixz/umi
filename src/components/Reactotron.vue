<template>
  <div>
    <img v-for="e in emoji" :key="e.name" :id="e.name" v-tooltip.bottom-center="e.name" :src="e.image ? e.image : `https://cdn.frankerfacez.com/emoticon/${e.id}/1`" class="emoji pointer grow dib mr1" @click="handleEmojiClick" />
  </div>
</template>

<script>
  import emoji from 'lib/emoji'

  export default {
    data () {
      return { emoji }
    },
    computed: {
      lights () {
        return this.$store.state.lights
      }
    },

    methods: {
      handleEmojiClick (e) {
        this.$emit('emoji', e.target.id)
      }
    }
  }
</script>
