<template>
  <div class="player" v-show="playList.length > 0">
    <!-- 展开的播放器 -->
    <transition name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
      >
      <div class="normal-player" v-show="fullScreen">
        <!-- 背景图 -->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <!-- 顶部 -->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!-- 中间 -->
        <div class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
          >
          <!-- 中间左侧 - CD -->
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img class="image" :src="currentSong.image" :class="cdCls">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- 中间右侧 - 歌词 -->
          <scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text"
                  :class="{'current': currentLineNum === index}"
                  v-for="(line, index) in currentLyric.lines" :key="index"
                  ref="lyricLine">{{ line.txt }}</p>
              </div>
            </div>
            <div class="pure-music">
              <p></p>
            </div>
          </scroll>
        </div>
        <!-- 底部 -->
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime) }}</span>
            <!-- 进度条 -->
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <!-- 操作,如 播放/暂停 -->
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 收起的播放器 -->
    <transition nama="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img width="40" height="40" :src="currentSong.image" :class="cdCls">
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniPlayIcon" @click.stop="togglePlaying" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 播放列表 -->
    <playlist ref="playlist"></playlist>
    <!-- 歌曲加载到播放的时候，会派发一个 canplay 事件，请求不到 ，派发 error -->
    <!-- 歌曲播放的时候派发 timeupdate 事件 -->
    <!-- 歌曲播放到结尾的时候派发 ended 事件 -->
    <audio :src="currentSong.url"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
      ref="audio"></audio>
  </div>
</template>
<script type='text/ecmascript-6'>
  import animations from 'create-keyframe-animation'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import Scroll from 'base/scroll/scroll'
  import Playlist from 'components/playlist/playlist.vue'
  import { playerMixin } from 'common/js/mixin'
  import { playMode } from 'common/js/config'
  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import { prefixStyle } from 'common/js/dom'
  import Lyric from 'lyric-parser'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    name: 'palyer',
    data() {
      return {
        songReady: false, // 歌曲是否加载完
        currentTime: 0, // 当前播放的时间
        radius: 32,
        currentLyric: null, // 当前歌曲歌词
        currentLineNum: 0, // 当前歌词的所在行
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    computed: {
      cdCls() { // 通过 判断 播放状态，来控制cd 图片是否旋转
        return this.playing ? 'play' : ''
      },
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniPlayIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      percent() { // 比例
        return this.currentTime / this.currentSong.duration
      },
      // mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    watch: {
      currentSong(newSong, oldSong) { // 监听当前歌曲的变化，实现 播放歌曲 功能
        if (!newSong.id) { // 如果没有歌曲，就什么都不做
          return
        }
        if (newSong.id === oldSong.id) { // 如果当前 歌曲的id一样的话，就不执行下面的方法
          return
        }
        if (this.currentLyric) { // 切换下一首，要把当前的歌词 停止 滚动
          this.currentLyric.stop()
        }
        setTimeout(() => { // dom 渲染完成之后在 执行里面的方法
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) { // 监听 播放状态 playing 的变化，实现 播放/暂停 的切换功能
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    created() {
      this.touch = {}
      // console.log(this.currentSong)
    },
    methods: {
      back() { // 收起全屏，提交了一个mutation，利用了 mapMutations 辅助函数
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      enter(el, done) {
        const { x, y, scale } = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})` // 小cd 的位置
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }

        // 注册动画,插件的 API
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400, // 持续时间
            easing: 'linear'
          }
        })

        // 运行动画
        animations.runAnimation(this.$refs.cdWrapper, 'move', done) // done 必选调用，调用之后进入下一个动画
      },
      afterEnter() {
        // 销毁动画
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const { x, y, scale } = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done) // done 必选调用，调用之后进入下一个动画
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      togglePlaying() { // 切换播放状态
        if (!this.songReady) { // 歌曲没有加载好，return ，不让点击
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) { // 切换歌词 滚动/暂停
          this.currentLyric.togglePlay()
        }
      },
      end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() { // 循环播放
        this.$refs.audio.currentTime = 0 // 播放的当前时间 重置为 0
        this.$refs.audio.play()
        if (this.currentLyric) { // 循环播放的情况下，歌词滚动到 最开始
          this.currentLyric.seek(0)
        }
      },
      prev() { // 上一首 ，监控 currentIndex 即可
        if (!this.songReady) { // 歌曲没有加载好，return ，不让点击
          return
        }
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playList.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) { // 如果是 暂停时，切换上一首，重新切换状态
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      next() { // 下一首
        if (!this.songReady) { // 歌曲没有加载好，return ，不让点击
          return
        }
        if (this.playList.length === 1) { // 如果播放列表只有一首歌，就循环
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playList.length) { // 如果是最后一首，设置为 0,
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) { // 如果是 暂停时，切换下一首，重新切换状态
            this.togglePlaying()
          }
        }
        this.songReady = false // 重置加载完的标志
      },
      ready() { // 歌曲加载完 设置为 true
        this.songReady = true
        // 保存当前歌曲到本地及vuex
        this.savePlayHistory(this.currentSong)
      },
      error() {
        this.songReady = true
      },
      updateTime(e) { // 获取播放的时间
        this.currentTime = e.target.currentTime
      },
      format(interval) { // 格式化 时间
        interval = interval | 0 // | 0 可以向下取整，相当于 Math.floor()
        const minute = interval / 60 | 0 // 获取分钟
        const second = this._pad(interval % 60) // 秒
        return `${minute}:${second}`
      },
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent
        // 设置当前歌曲播放的时间
        this.$refs.audio.currentTime = currentTime // 总时长 x 百分比
        // 拖动的时候暂停状态，停止拖动的时候就播放
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) { // 设置滑动进度条，歌词同步的步骤
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) { // 播放状态,歌词播放
            this.currentLyric.play()
          }
        }).catch(() => { // 获取不到歌词的情况
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({ lineNum, txt }) {
        this.currentLineNum = lineNum
        // 实现歌词始终在 中间
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt // 设置当前歌词
      },
      showPlaylist() {
        this.$refs.playlist.show()
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) { // 如果没有初始化，什么都不做
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) { // 纵向滚动的话，什么都不做
          return
        }
        // 两种情况，在 cd 页，左滑；lyric 页，右滑
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        // Math.min(0, ...) 取最大不能大于 0 的值； Math.max(-window.innerWidth) 最小不能 小于 -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX)) // 偏移的宽度
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth) // 偏移宽度与屏幕宽度的比例
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        // 考虑两种情况：
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) { // 大于 10% 滑动
            offsetWidth = -window.innerWidth
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 1
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms` // 缓动效果
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },
      _pad(num, n = 2) { // 秒数一位数的时候前面 补 0
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      _getPosAndScale() { // 获取初始的位置 和 缩放比例
        const targetWidth = 40 // mini cd 的宽度
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8 // 中间 cd 的宽度是 屏幕宽度的 80%
        const scale = targetWidth / width // 小 cd 与 大 cd 的比例
        const x = -(window.innerWidth / 2 - paddingLeft) // x轴
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // y轴
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingSate: 'SET_PLAYING_START', // 设置开始/暂停 mutation
        setCurrentIndex: 'SET_CURRENT_INDEX' // 设置 当前歌曲的索引
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  }
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position fixed
      left 0
      right 0
      top 0
      bottom 0
      z-index 150
      background $color-background
      .background
        position absolute
        left 0
        top 0
        width 100%
        height 100%
        z-index -1
        opacity 0.6
        filter blur(20px)
      .top
        position relative
        margin-bottom 25px
        .back
          position absolute
          top 0
          left 6px
          z-index 50
          .icon-back
            display block
            padding 9px
            font-size $font-size-large-x
            color $color-theme
            transform rotate(-90deg)
        .title
          width 70%
          margin 0 auto
          line-height 40px
          text-align center
          no-wrap()
          font-size $font-size-large
          color $color-text
        .subtitle
          line-height 20px
          text-align center
          font-size $font-size-medium
          color $color-text
      .middle
        position fixed
        width 100%
        top 80px
        bottom 170px
        white-space nowrap
        font-size 0
        .middle-l
          display inline-block
          vertical-align top
          position relative
          width 100%
          height 0
          padding-top 80%
          .cd-wrapper
            position absolute
            left 10%
            top 0
            width 80%
            height 100%
            box-sizing border-box
            .cd
              width 100%
              height 100%
              border-radius 50%
              .image
                position absolute
                left 0
                top 0
                width 100%
                height 100%
                box-sizing border-box
                border-radius 50%
                border 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation rotate 20s linear infinite
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)

    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)

</style>