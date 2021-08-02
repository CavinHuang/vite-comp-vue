import { defineComponent } from 'vue'
import routerPaths from '@routerPaths'

export default defineComponent({
  name: 'App',
  setup() {
    console.log(typeof routerPaths)
    return () => (
      <>
        <h1>test</h1>
        {routerPaths.routerPaths.map(item => {
          return <a href={item.path}>{item.path}</a>
        })}
      </>
    )
  }
})
