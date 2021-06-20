import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    content: String
  },
  setup(props) {
    return () => (
      <div class='marked-content' v-html={props.content.replace(/"/g, '') || ''}></div>
    )
  }
})

