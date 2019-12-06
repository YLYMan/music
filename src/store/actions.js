// 异步操作 或 对 mutation 做一些封装

import * as types from './mutation-types'

// 点击播放需要提交的 mutation
export const selectPlay = function ({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAY_LIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_START, true)
}