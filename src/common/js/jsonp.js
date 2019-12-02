import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data) // url 路径可能有？或 &，要注意
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => { // 原生jsonp 参数 3个
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

// 处理data 数据
function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}` // 拼接 url 参数
  }
  return url ? url.substring(1) : '' // URL 如果有，要先去除第一个 & 字符
}