import { defineComponent, ref } from 'vue'
export default defineComponent({
  props: {

  },
  setup() {
    const number = ref(2)
    return () => (
      <div>aa111aaa{ number.value }</div>
    )
  }
})
