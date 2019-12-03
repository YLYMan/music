<template>
  <div ref="wrapper">
    <!-- 插槽 -->
    <slot></slot>
  </div>
</template>
<script type='text/ecmascript-6'>
  import BScroll from 'better-scroll'
  export default {
    name: 'scroll',
    props: {
      probeType: { // 监听派发事件，默认0，不派发。可以知道滚动的位置
        type: Number,
        default: 1
      },
      click: { // better-scroll 默认会阻止浏览器的原生 click 事件
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      }
    },
    mounted() {
      // 确保数据已经渲染，用一个定时器
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
      },
      // 代理 better-scroll 插件的方法
      enable() { // 启用 better-scroll, 默认 开启
        this.scroll && this.scroll.enable()
      },
      disable() { // 禁用 better-scroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
        this.scroll && this.scroll.disable()
      },
      refresh() { // 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常
        this.scroll && this.scroll.refresh()
      }
    },
    watch: {
      data() { // 监听data 的变化，发生变化刷新
        setTimeout(() => {
          this.refresh()
        }, 20)
      }
    }
  }
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
  
</style>