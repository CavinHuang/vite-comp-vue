<template>
  <h1>Layout</h1>
  <page-content />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Content as PageContent } from '../../components/pageContent'

export default defineComponent({
  components: {
    PageContent
  }
})
</script>