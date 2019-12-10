<template>
  <div class="singer" ref="singer">
    <list-view :data="singers" @select="slectSinger" ref="list"></list-view>
    <!-- 子路由展示区 -->
    <router-view></router-view>
  </div>
</template>
<script type='text/ecmascript-6'>

  import ListView from 'base/listview/listview'
  import Singer from 'common/js/singer'
  import { mapMutations } from 'vuex'
  import { getSingerList } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import { playListMixin } from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10
  export default {
    mixins: [playListMixin],
    name: 'singer',
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlayList(playList) {
        const bottom = playList.length > 0 ? '60px' : 0
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      slectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer) // 将 this.setSinger(singer)` 映射为 `this.$store.commit('SET_SINGER', singer)
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) { // 前10条数据变成 热门数据
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
        })
        // 为了得到 有序列表，我们需要处理 map
        let ret = [] // 值数组
        let hot = [] // 热门数组
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => { // 升序排序 a-z
          // charCodeAt() 方法可返回指定位置的字符的 Unicode 编码
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      ...mapMutations({ // 把 mutations 修改, 映射成一个方法名，如：setSinger
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      ListView
    }
  }
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>