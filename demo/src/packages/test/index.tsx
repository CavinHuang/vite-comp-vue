import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    msg: {
      type: String,
      default: 'test'
    }
  },
  setup() {
    return () => (
      <div>test1</div>
    )
  }
})
