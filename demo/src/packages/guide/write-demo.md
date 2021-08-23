## 写 Demo

我们很赞同 [dumi 的 Demo 理念](https://d.umijs.org/zh-CN/guide/demo-principle)，并以它为标准来实现的 demo 功能。

### demo 类型

- 第一种写 demo 的形式。

```md
<demo src="../../components/Test.tsx"
  language="vue"
  title="Demo演示"
  desc="这是一个Demo渲染示例">
</demo>
```

渲染效果如下
<demo src="../../components/Test.tsx"
  language="vue"
  title="Demo演示"
  desc="这是一个Demo渲染示例">
</demo>

- 第二种

```md
  #```vue demo
    <template>
      <div>
        <Test />
        <div>萨达的撒的撒多所大</div>
      </div>
    </template>
    <script>
    import Test from './index.tsx'

    export default {
      components: {
        Test
      }
    }
    </script>  
  #```
```
渲染效果如下：

```vue demo
<template>
  <div>
    <Test />
    <div>sssssss萨达萨达试试111111撒多撒</div>
  </div>
</template>
<script>
import Test from '../../components/Test.tsx'

export default {
  components: {
    Test
  }
}
</script>  
```

```vue demo
<template>
  <div>
    <Test />
    <div>dddddda啊啊啊啊aasss</div>
  </div>
</template>
<script>
import Test from '../../components/Test.tsx'

export default {
  components: {
    Test
  }
}
</script>  
```

- 第三种

\`\`\`vue demo src="./test.vue"

\`\`\`

\`\`\`typescript src="./test.ts"

\`\`\`