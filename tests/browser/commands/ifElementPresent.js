
exports.command = function ifElementPresent (selector, func, callback) {
  this.element('css selector', selector, (result) => {
    if (result.status === 0) {
      func()
    }
  })

  if (typeof callback === 'function') {
    callback.call(this)
  }

  return this
}
