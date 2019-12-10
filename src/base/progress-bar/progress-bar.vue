<template>
  <!-- 总长度 -->
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <!-- 走过的位置 -->
      <div class="progress" ref="progress"></div>
      <!-- 按钮，当前的位置 -->
      <div class="progress-btn-wrapper"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
        ref="progressBtn">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>
<script type='text/ecmascript-6'>
  import { prefixStyle } from 'common/js/dom'
  
  const progressBtnWidth = 16
  const transform = prefixStyle('transform')
  export default {
    name: 'progress-bar',
    data() {
      return {

      }
    },
    props: {
      percent: { // 进度条
        type: Number,
        default: 0
      }
    },
    watch: {
      percent(newPercent) {
        if (newPercent >= 0 && !this.touch.initiated) { // !this.touch.initiated 表示小球 不在 拖动的过程中
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const offsetWidth = newPercent * barWidth
          this._offset(offsetWidth)
        }
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      progressTouchStart(e) {
        this.touch.initiated = true // 初始化标志
        this.touch.startX = e.touches[0].pageX // 记录手指的落下位置
        this.touch.left = this.$refs.progress.clientWidth // 记录走动滚动条的偏移宽度
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX // 滑动的距离
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX)) // 黄色 bar 要走的距离
        this._offset(offsetWidth)
      },
      progressTouchEnd() {
        this.touch.initiated = false
        // 派发事件，通知外部 百分比的 变化
        this._triggerPercent()
      },
      progressClick(e) {
        // 设置 偏移量
        const rect = this.$refs.progressBar.getBoundingClientRect() // 按钮到左侧的位置
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        // 当我们点击 progressBtn 的时候，e.offsetX 获取的数据不对
        // this._offset(e.offsetX)
        // 派发事件，通知外部
        this._triggerPercent()
      },
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      },
      _offset(offsetWidth) { // 进度条 和 小球 要走的距离
        this.$refs.progress.style.width = `${offsetWidth}px` // 进度条
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)` // 小球
      }
    }
  }
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
  @import "~common/stylus/variable"
  
  .progress-bar
    height 30px
    .bar-inner
      position relative
      top 13px
      height 4px
      background rgba(0, 0, 0, 0.3)
      .progress
        position absolute
        height 100%
        background $color-theme
      .progress-btn-wrapper
        position absolute
        left -8px
        top  -13px
        width 30px
        height 30px
        .progress-btn
          position relative
          top 7px
          left 7px
          box-sizing border-box
          width 16px
          height 16px
          border 3px solid $color-text
          border-radius 50%
          background $color-theme
</style>