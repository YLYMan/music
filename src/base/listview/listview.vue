<template>
  <scroll class="listview"
    :data="data"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
    ref="listview">
    <!-- 歌手列表 -->
    <ul>
      <li class="list-group" v-for="(group, index) in data" :key="index" ref="listGroup">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li class="list-group-item" v-for="(item, i) in group.items" :key="i" @click="selectItem(item)">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 右侧列表 -->
    <!-- 修饰符 .stop.prevent 阻止冒泡 -->
    <div class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
      >
      <ul>
        <!-- currentIndex === index 的时候，添加高亮 样式 -->
        <li class="item"
          v-for="(item, index) in shortcutList" :key="index"
          :class="{'current': currentIndex === index}"
          :data-index="index"
          >
          {{ item }}
        </li>
      </ul>
    </div>
    <!-- 滚动固定标题 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <!-- 加载页面 -->
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>
<script type='text/ecmascript-6'>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import { getData } from 'common/js/dom'
  const ANCHOR_HEIGHT = 18 // 计算出来的右侧字母元素的高度
  const TITLE_HEIGHT = 30 // 固定标题 的高度
  export default {
    name: '',
    data() {
      return {
        scrollY: -1, // 观测的y 值
        currentIndex: 0, // 右侧哪个数字 高亮显示
        diff: -1 // 上限 与 滚动位置 的 区间值
      }
    },
    props: {
      data: {
        type: Array,
        default() {
          return []
        }
      }
    },
    created() {
      this.touch = {} // 两个函数共享的数据，不需要变成响应式（所以不放到data 中）
      this.listenScroll = true // 开启监听滚动
      this.listHeight = [] // 列表高度
      this.probeType = 3
    },
    computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1) // 获取 title 的第一个字母
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) { // 向下拉时，this.scrollY 大于 0，正值
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      selectItem(item) {
        this.$emit('select', item) // 派发点击事件，进行路由跳转
      },
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index') // anchor 锚点  anchorIndex 取到的是一个字符串
        let firstTouch = e.touches[0] // 获取手指最初的位置
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // 移动了多少 （| 0 向下取整）
        console.log(delta)
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta // 移动后的位置
        console.log(anchorIndex)
        this._scrollTo(anchorIndex)
      },
      scroll(pos) {
        this.scrollY = pos.y // 监听scroll 事件，实时获取到 scroll 滚动的 y值
      },
      refresh() {
        this.$refs.listview.refresh()
      },
      _scrollTo(index) { // 滚到到指定位置
        if (!index && index !== 0) { // null 的情况，return
          return
        }
        if (index < 0) { // 在右侧滑动的时候，index 可能小于 0 也可能 大于 最后一个 元素的索引
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index] // 点击右侧的字母需要手动赋值 给 this.scrollY
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 第二个参数是滚动动画 0 没有,瞬间移动到指定位置
      },
      _calculateHeight() { // 计算高度
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      }
    },
    watch: {
      data() { // 监听传过来的歌手 data 数据
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      // better-scroll 获取到的值，所以 watch 它的变化
      scrollY(newY) { // newY 向上滚动拿到的是 负值, 向下 取到的是 正值，可以大于 0
        const listHeight = this.listHeight
        // 当滚动到 顶部，newY > 0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) { // listHeight 的长度比右侧元素多一个
          let height1 = listHeight[i] // 下限
          let height2 = listHeight[i + 1] // 上限
          // 如果 是最后一个（!height2）
          // 或者 获取的值 -newY 大于下限小于上限 (-newY > height1 && -newY < height2)
          // currentIndex 为 索引 i
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到 底部，且 -newY 大于 最后一个元素的上限
        // listHeight 的长度比右侧元素多一个（最开始添加了 0）, 所以右侧最后一个元素的索引 是 -2 的值
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) { // 固定标题滑动实现（向上顶的实现）
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0 // 向上滚是负数 (newVal - TITLE_HEIGHT)
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop // 减少dom 操作
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
  @import '~common/stylus/variable'

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      z-index: 30
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>