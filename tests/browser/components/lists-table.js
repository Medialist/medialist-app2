'use strict'

module.exports = (dataId) => ({
  selector: `[data-id=${dataId}]`,
  elements: {
    addNewListButton: '[data-id=add-new-list-button]',
    newListInput: '[data-id=add-new-list-input]',
    saveNewListButton: '[data-id=save-new-list-button]',
    saveButton: '[data-id=save-list-button]',
    editButton: '[data-id=edit-list-button]',
    deleteButton: '[data-id=delete-list-button]'
  },
  commands: [{
    createNewList: function (name) {
      this
        .waitForElementVisible('@addNewListButton')
        .click('@addNewListButton')
        .waitForElementVisible('@newListInput')
        .setValue('@newListInput', name)
        .waitForElementVisible('@saveNewListButton')
        .click('@saveNewListButton')

      return this
    },
    updateListName: function (list, name) {
      const selector = `[data-item='${list._id}']`

      this
        .waitForElementVisible(`${selector} [data-id=edit-list-button]`)
        .click(`${selector} [data-id=edit-list-button]`)
        .waitForElementVisible(`${selector} [data-id=list-name-input]`)
        .clearValue(`${selector} [data-id=list-name-input]`)
        .setValue(`${selector} [data-id=list-name-input]`, name)
        .waitForElementVisible(`${selector} [data-id=save-list-button]`)
        .click(`${selector} [data-id=save-list-button]`)

      return this
    },
    openDeleteListsModal: function (list) {
      const selector = `[data-item='${list._id}']`

      this
        .waitForElementVisible(`${selector} [data-id=delete-list-button]`)
        .click(`${selector} [data-id=delete-list-button]`)

      return this
    },
    assertNotInList: function (list) {
      const selector = `[data-item='${list._id}']`

      this.assert.elementNotPresent(selector)

      return this
    }
  }]
})
