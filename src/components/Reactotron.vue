<template>
  <div>
    <img v-for="e in emoji" :key="e.name" :id="e.name" v-tooltip.bottom-center="e.name" :src="e.image ? e.image : `https://cdn.frankerfacez.com/emoticon/${e.id}/1`" class="emoji pointer grow dib mr1" @click="handleEmojiClick" />
  </div>
</template>

<script>
  import emoji from 'lib/emoji'

  function shuffle (arr) {
    const array = Array.from(arr) // duplicate
    let counter = array.length

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter)

      // Decrease counter by 1
      counter--

      // And swap the last element with it
      let temp = array[counter]
      array[counter] = array[index]
      array[index] = temp
    }

    return array
}

  export default {
    data () {
      return {
        emoji: shuffle(emoji)
      }
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

<style scoped>

</style>
