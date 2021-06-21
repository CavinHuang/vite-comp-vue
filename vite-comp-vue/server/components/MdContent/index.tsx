import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    content: String
  },
  setup(props) {
    return () => (
      <div class='markdown-body' v-html={props.content.replace(/"/g, '') || ''}></div>
    )
  }
})

