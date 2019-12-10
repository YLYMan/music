// 获取 两数之间的 随机数，包括max
function getRandomInt(min, max) {
  // Math.random() * (max - min + 1) 取到的是 max 减 min 中间的数
  return Math.floor(Math.random() * (max - min + 1) + min) // + 1 是为了保证 max 上限值
}

// 洗牌算法函数
export function shuffle(arr) {
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}