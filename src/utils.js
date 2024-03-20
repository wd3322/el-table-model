const getPrototype = function(value) {
  return Object.prototype.toString.call(value).replace(/^\[object (\S+)\]$/, '$1').toLowerCase()
}

const convertHumpStr = function(value, tag = '-') {
  const arr = value.split(tag)
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    result = result + arr[i].slice(0, 1).toUpperCase() + arr[i].slice(1)
  }
  return result
}

export default {
  getPrototype,
  convertHumpStr
}
