'use strict'

module.exports = {
  selector: '[data-id=contacts-table]',
  elements: {
    searchContactsInput: '[data-id=search-contacts-input]',
    contactsTableSearchResults: '[data-id=contacts-table-search-results]',
    contactsTableUnfiltered: '[data-id=contacts-table-unfiltered]'
  },
  commands: [{
    searchFor: function (query) {
      this
        .waitForElementVisible('@searchContactsInput')
        .clearValue('@searchContactsInput')
        .waitForElementVisible('@contactsTableUnfiltered')
        .setValue('@searchContactsInput', query)
        .waitForElementVisible('@contactsTableSearchResults')

      return this
    },
    selectRow: function (index) {
      const rowSelector = `[data-id=contacts-table-row-${index}]`
      const checkboxSelector = `[data-id=contacts-table-row-${index}-checkbox-label]`

      this
        .moveToElement(rowSelector, 10, 10)
        .waitForElementVisible(checkboxSelector)
        .click(checkboxSelector)

      return this
    },
    clickRow: function (index) {
      const selector = `[data-id=contacts-table-row-${index}] [data-id=contact-link]`

      this
        .waitForElementVisible(selector)
        .click(selector)

      return this
    },
    isInResults: function (contact) {
      this.assert.elementPresent(`[data-id=contact-link][data-contact='${contact._id}']`)
    },
    isNotInResults: function (contact) {
      this.assert.elementNotPresent(`[data-id=contact-link][data-contact='${contact._id}']`)
    }
  }]
}
