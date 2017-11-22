// Get state for multiple elements
// getState is passed an element and should return a promise that gets some state
// e.g. http://nightwatchjs.org/api#elementIdText
// Callback will be called with an array of the state values once they're all resolved
exports.command = function getElementsState (selector, getState, callback) {
  this.elements('css selector', selector, function (elements) {
    const values = elements.value.map(getState)
    Promise.all(values).then(callback)
  })
  return this
}
