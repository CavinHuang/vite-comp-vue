import { defineComponent, PropType } from 'vue'
import MdContent from './components/MdContent'
import MdExample from './components/MdExample'
import { MdModule } from '../shared/markdown'

export default defineComponent({
  name: 'App',
  props: {
    content: String,
    modules: {
      type: Array as PropType<MdModule>,
      default: []
    }
  },
  setup(props) {
    return () => (
    <>
        <MdContent content={props.content} />
        {props.modules.map(item => {
          if (item.type === 'tsx') {
            return <MdExample code={item.content.join('')} />
          }
        }) }
    </>
    )
  }
})
