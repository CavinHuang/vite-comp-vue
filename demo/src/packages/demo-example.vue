<template>
  <div>
   <Test />
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import Test from '../components/Test'
export default {
  components: {
    Test,
  },
  setup() {
    const count = ref(0)
    function onClick() {
      count.value++
    }

    return {
      count,
      onClick
    }
  }
}
</script>

<style lang="css">
.text {
  font-size: 14px;
}
</style>
