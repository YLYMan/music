// 入口

import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger' // 可以查看vuex修改的记录

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production' // 调试工具

export default new Vuex.Store({ // 单例模式
  actions,
  getters,
  state,
  mutations,
  strict: debug, // 严格模式。开发环境下开启， 如：直接修改state 会报错等
  plugins: debug ? [createLogger()] : []
})