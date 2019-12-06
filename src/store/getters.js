// 获取 state ，对 state 做一些映射
// 这里的函数 类似于 计算属性，可以写一些复杂的业务逻辑

export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playList = state => state.playList

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => { // 当前歌曲(计算而来的)
  return state.playList[state.currentIndex] || {}
}
