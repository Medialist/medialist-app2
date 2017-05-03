'use strict'

module.exports = (dataId) => ({
  selector: `[data-id=${dataId}]`,
  elements: {
    saveButton: '[data-id=add-to-list-modal-save-button]',
    cancelButton: '[data-id=add-to-list-modal-cancel-button]',
    manageListsButton: '[data-id=add-to-list-modal-manage-lists-button]'
  },
  commands: [{
    selectList: function (list) {
      const selector = `[data-id=master-list-button][data-item='${list._id}']`

      this
        .waitForElementVisible(selector)
        .click(selector)

      return this
    },
    deselectList: function (list) {
      const selector = `[data-id=master-list-button][data-item='${list._id}']`

      this
        .waitForElementVisible(selector)
        .click(selector)

      return this
    },
    save: function () {
      this
        .waitForElementVisible('@saveButton')
        .click('@saveButton')

      return this
    }
  }]
})
