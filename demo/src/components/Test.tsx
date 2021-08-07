import { defineComponent, ref } from 'vue'
export default defineComponent({
  props: {

  },
  setup() {
    const number = ref(2)
    const onClickHandler = () => {
      number.value ++
    }
    return () => (
      <>
        <button onClick={onClickHandler}>点我+1</button>
        <div>当前数值：{ number.value }</div>
      </>
    )
  }
})
