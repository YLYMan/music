<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :key="index" :class="{ active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>
<script type='text/ecmascript-6'>
  import BScroll from 'better-scroll'
  import { addClass } from 'common/js/dom'
  export default {
    name: 'slider',
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    props: {
      loop: { // 是否循环播放
        type: Boolean,
        default: true
      },
      autoPlay: { // 自动播放
        type: Boolean,
        default: true
      },
      interval: { // 播放间隔
        type: Number,
        default: 4000
      }
    },
    mounted() { // 在mounted 的时候渲染，否则没效果
      setTimeout(() => {
        this._setSliderWidth() // 横向滚动，先获取slider的宽度，再初始化slider
        this._initDots()
        this._initSlider()

        if (this.autoPlay) {
          this._play()
        }
      }, 20) // 浏览器的刷新频率是 17ms 左右

      // 监听 浏览器的resize 事件，防止 窗口大小改变，slider 的宽度不对
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        // refresh() 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常
        this.slider.refresh()
      })
    },
    destroyed() {
      // 组件销毁的时候手动清除 定时器
      clearTimeout(this.timer)
    },
    methods: {
      // 横向滚动，先获取slider的宽度，再初始化slider
      _setSliderWidth(isResize) {
        this.children = this.$refs.sliderGroup.children
        
        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth // 父容器的宽度
        // 给每一个 slider 添加类名，设置宽度
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')

          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 如果 loop 为 true，它会向左右两侧各添加一个slider，以确保无缝滑动的效果
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, { // 第一个参数是 dom
          scrollX: true,
          scrollY: false,
          momentum: false, // 不开启动画
          snap: true, // 为了做 Slide 组件用的
          snapLoop: this.loop,
          snapThreshold: 0.3, // threshold 表示可滚动到下一个的阈值
          snapSpeed: 400, // speed 表示鼠标滚轮滚动的速度
          click: true // 此事件容易与 fastclick 插件冲突
        })
        // dots 和 滚动的页面联动
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          // 如果是 loop 的情况下，左右会各多出一张图
          if (this.loop) {
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex

          if (this.autoPlay) {
            // 防止手动滑动 与 自动滑动的冲突
            clearTimeout(this.timer)
            this._play()
          }
        })
      },
      _play() { // 自动播放
        let pageIndex = this.currentPageIndex + 1 // currentPageIndex 从 0 开始
        if (this.loop) { // 如果 loop 为 true，前后都会加一张
          pageIndex += 1 // 逻辑上从第二张开始，视觉上是从 第一张开始的
        }
        this.timer = setTimeout(() => {
          // goToPage(x 横轴的页数, y 纵轴的页数, 默认间隔时间) better-scroll插件自带方法
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    }
  }
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>