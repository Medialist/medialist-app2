'use strict'

module.exports = (dataId) => ({
  selector: `[data-id=${dataId}]`,
  elements: {
    confirmButton: '[data-id=confirm-delete-button]',
    cancelButton: '[data-id=cancel-delete-button]'
  },
  commands: [{
    confirm: function (tag) {
      this
        .waitForElementVisible('@confirmButton')
        .click('@confirmButton')

      return this
    },
    cancel: function () {
      this
        .waitForElementVisible('@cancelButton')
        .click('@cancelButton')

      return this
    }
  }]
})
