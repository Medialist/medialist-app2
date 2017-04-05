
exports.command = function ifElementNotPresent (selector, func, callback) {
  this.element('css selector', selector, (result) => {
    if (!result.value || !result.value.ELEMENT) {
      func()
    }
  })

  if (typeof callback === 'function') {
    callback.call(this)
  }

  return this
}
