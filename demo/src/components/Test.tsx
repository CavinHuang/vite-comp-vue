import { defineComponent, ref } from 'vue'
export default defineComponent({
  props: {

  },
  setup() {
    const number = ref(2)
    const onClickHandler = () => {
      number.value ++
    }
    const clickAlert = () => {
      alert("测试测试测试" + number.value)
    }
    return () => (
      <>
        <button onClick={onClickHandler}>点我1111+1</button>
        <div>当前数值：{ number.value }</div>
        <button onClick={clickAlert}>显示弹窗</button>
      </>
    )
  }
})
