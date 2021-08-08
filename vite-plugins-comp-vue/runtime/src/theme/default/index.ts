import './styles/vars.css'
import './styles/layout.css'
import './styles/code.css'
import './styles/custom-blocks.css'
import './styles/markdown.css'
import './styles/reset.css'
import './styles/sidebar-links.css'

import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import { Theme } from './types'

/**
 * 布局数据
 */
const theme: Theme = {
  Layout,
  NotFound
}

export default theme
