// 管理所有状态

import { playMode } from 'common/js/config'
import { loadSearch, loadPlay, loadFavorite } from 'common/js/cache'

const state = {
  singer: {}, // 歌手数据
  playing: false, // 播放
  fullScreen: false, // 全屏
  playList: [], // 播放列表
  sequenceList: [], // 顺序播放列表
  mode: playMode.sequence, // 播放模式
  currentIndex: -1, // 当前播放歌的索引
  disc: {}, // 歌单
  topList: {}, // 榜单列表
  searchHistory: loadSearch(), // 搜索历史
  playHistory: loadPlay(), // 播放历史
  favoriteList: loadFavorite() // 喜欢的歌曲
}

export default state