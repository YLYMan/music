<template>
  <!-- transition 添加进入/离开的过渡效果 -->
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>
<script type='text/ecmascript-6'>

  import MusicList from 'components/music-list/music-list'

  import { mapGetters } from 'vuex'
  import { getSingerDetail } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'

  export default {
    name: 'singer-detail',
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer' // 相当于在 vue 实例中，挂载了一个singer属性
      ])
    },
    created() {
      // console.log(this.singer)
      this._getDetail()
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) { // 如果在详情页刷新，回退到上一路由（边界处理的示例！！！）
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            // 后台代理接口，经过处理返回的歌曲列表
            processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
              // console.log(songs)
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let { musicData } = item
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
  @import "~common/stylus/variable"

  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d( 100%, 0, 0)
</style>