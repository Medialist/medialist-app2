// Get text for multiple elements
// Callback is called with an array of texts for the matching elements
exports.command = function getElementsText (selector, callback) {
  const getState = (element) => {
    return new Promise((resolve) => {
      this.elementIdText(element.ELEMENT, (text) => resolve(text.value))
    })
  }

  return this.getElementsState(selector, getState, callback)
}
