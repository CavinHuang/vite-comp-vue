import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Test from './components/Test'

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld
  },
  setup () {
    return () => (
      <>
        <img alt="Vue logo" src="./src/assets/logo.png" />
        <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
        <Test />
      </>
    )
  }
})
