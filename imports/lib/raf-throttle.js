// idea from https://www.html5rocks.com/en/tutorials/speed/animations/
// pulled from https://github.com/wuct/raf-throttle/blob/11ab941b7962bf40b892952356e8e027c125e589/index.js
const rafThrottle = callback => {
  let requestId

  const later = args => () => {
    requestId = null
    callback(...args)
  }

  const throttled = (...args) => {
    if (requestId == null) {
      requestId = window.requestAnimationFrame(later(args))
    }
  }

  throttled.cancel = () =>
    window.cancelAnimationFrame(requestId)

  return throttled
}

export default rafThrottle
