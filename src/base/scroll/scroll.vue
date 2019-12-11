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
        default: false
      },
      data: { // 传入的数据
        type: Array,
        default: null
      },
      listenScroll: { // 要不要监听滚动事件
        type: Boolean,
        default: false
      },
      pullup: { // 上拉刷新事件
        type: Boolean,
        default: false
      },
      beforeScroll: { // 用来对手机端的弹起键盘做处理
        type: Boolean,
        default: false
      }
    },
    mounted() {
      // 确保数据已经渲染，用一个定时器
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() { // 初始化better-scroll 插件
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        // 如果有监听滚动，就派发滚动事件
        if (this.listenScroll) {
          let me = this
          this.scroll.on('scroll', (pos) => {
            me.$emit('scroll', pos) // 派发一个 scroll 事件
          })
        }
        // 如果 this.pullup 为 true，就监听 scrollEnd 事件(滚动完了)
        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) { // this.scroll.maxScrollY + 50 距离底部的50像素
              this.$emit('scrollToEnd')
            }
          })
        }
        // 监听 beforeScrollStart 滚动前事件
        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll')
          })
        }
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
      },
      scrollTo() { // 滚动到指定的位置, 可以传参数
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() { // 滚动到指定的目标元素。
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
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