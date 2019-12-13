import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

export const playListMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  watch: {
    playList(newVal) {
      this.handlePlayList(newVal)
    }
  },
  mounted() {
    this.handlePlayList(this.playList)
  },
  activated() {
    this.handlePlayList(this.playList)
  },
  methods: {
    handlePlayList() {
      throw new Error('component must implement handlePlayList method')
    }
  }
}

// 切换播放模式
export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    // mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性
    ...mapGetters([
      'sequenceList',
      'playList',
      'currentSong',
      'mode'
    ])
  },
  methods: {
    changeMode() { // 切换模式
      const mode = (this.mode + 1) % 3
      // 提交 mutation，切换 mode
      this.setMode(mode)
      // 实现功能
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list) // 设置当前播放的歌曲不变
      this.setPlayList(list) // 设置播放列表
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_START',
      setMode: 'SET_MODE',
      setPlayList: 'SET_PLAY_LIST'
    })
  }
}

// 保存搜索历史
export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    onQueryChange(query) {
      this.query = query
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    saveSearch() {
      // 保存搜索历史
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}