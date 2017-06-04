'use strict'

module.exports = (dataId) => ({
  selector: `[data-id='${dataId}']`,
  elements: {
    searchInput: '[data-id=tag-search-input]',
    createNewTag: '[data-id=create-new-tag]',
    saveButton: '[data-id=tag-selector-modal-save-button]',
    cancelButton: '[data-id=tag-selector-modal-cancel-button]'
  },
  commands: [{
    addTag: function (tag) {
      this
        .waitForElementVisible('@searchInput')
        .clear('@searchInput')
        .setValue('@searchInput', tag)
        .waitForElementVisible('@createNewTag')
        .click('@createNewTag')

      return this
    },
    removeTag: function (tag) {
      const selector = `[data-tag='${tag}'] [data-id=remove-tag-button]`

      this
        .waitForElementVisible('@searchInput')
        .waitForElementVisible(selector)
        .click(selector)
        .waitForElementNotPresent(selector)

      return this
    },
    save: function () {
      this
        .waitForElementVisible('@saveButton')
        .click('@saveButton')

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
