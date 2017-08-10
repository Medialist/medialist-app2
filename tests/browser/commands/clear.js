exports.command = function clear (selector) {
  this.clearValue(selector, (result) => {
    this.getValue(selector, (result) => {
      // Sometimes `clearValue` doesn't work, so we add some robustness here,
      // manually sending enough BACK_SPACE keypress to delete the contents
      const stragglers = result.value.length
      if (stragglers) {
        var deletes = Array(stragglers).fill(this.Keys.BACK_SPACE)
        this.setValue(selector, deletes)
      }
    })
  })
  return this
}
