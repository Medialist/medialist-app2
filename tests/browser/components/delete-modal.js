'use strict'

module.exports = (dataId) => ({
  selector: `[data-id='${dataId}']`,
  elements: {
    confirmButton: '[data-id=confirm-button]',
    cancelButton: '[data-id=cancel-button]'
  },
  commands: [{
    confirm: function (tag) {
      this
        .waitForElementVisible('@confirmButton')
        .click('@confirmButton')
        .waitForElementNotPresent(this.selector)

      return this
    },
    cancel: function () {
      this
        .waitForElementVisible('@cancelButton')
        .click('@cancelButton')
        .waitForElementNotPresent(this.selector)

      return this
    }
  }]
})
