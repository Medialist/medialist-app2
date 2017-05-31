
exports.command = function clear (selector) {
  this.getValue(selector, (result) => {
    for (var i = 0; i < result.value.length; i++) {
      this.setValue(selector, this.Keys.BACK_SPACE)
    }
  })

  return this
}
