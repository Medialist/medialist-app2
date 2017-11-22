exports.command = function clearSlow (selector) {
  this.getValue(selector, (result) => {
    const numChars = result.value.length
    if (numChars) {
      var dels = Array(numChars).fill(this.Keys.BACK_SPACE)
      this.setValue(selector, dels)
    }
  })

  return this
}
