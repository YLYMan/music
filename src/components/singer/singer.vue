<template>
  <div class="singer">
    <list-view :data="singers"></list-view>
  </div>
</template>
<script type='text/ecmascript-6'>

  import ListView from 'base/listview/listview'
  import { getSingerList } from 'api/singer'
  import Singer from 'common/js/singer'
  import { ERR_OK } from 'api/config'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10
  export default {
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
      }
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