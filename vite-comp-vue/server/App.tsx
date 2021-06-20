import { defineComponent } from 'vue'
import MdContent from './components/MdContent'
export default defineComponent({
  name: 'App',
  props: {
    content: String
  },
  setup(props) {
    return () => (
    <>
        <MdContent content={props.content} />
    </>
    )
  }
})
