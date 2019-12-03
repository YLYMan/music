<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <m-header></m-header>
    <tab></tab>
    <!-- keep-alive 缓存tab组件切换时的内容(优化内容) -->
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'

  export default {
    name: 'App',
    components: {
      MHeader,
      Tab
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "common/stylus/variable"

  #app
    // color: $color-theme
</style>