'use strict'

module.exports = {
  selector: '[data-id=contacts-table]',
  elements: {
    searchInput: '[data-id=search-contacts-input]',
    searchResults: '[data-id=contacts-table-search-results]',
    unfilteredList: '[data-id=contacts-table-unfiltered]',
    noResults: '[data-id=contacts-table-empty]'
  },
  commands: [{
    searchFor: function (query) {
      this
        .waitForElementVisible('@searchInput')
        .clearValue('@searchInput')
        .waitForElementVisible('@unfilteredList')
        .setValue('@searchInput', query)
        .waitForElementVisible('@searchResults')

      return this
    },
    searchForWithoutFinding: function (query) {
      this
        .waitForElementVisible('@searchInput')
        .clearValue('@searchInput')
        .waitForElementVisible('@unfilteredList')
        .setValue('@searchInput', query)
        .waitForElementVisible('@noResults')

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
        .waitForElementNotPresent(selector)

      return this
    },
    updateStatus: function (contact, status) {
      const buttonSelector = `[data-item='${contact._id}'] [data-id=contact-status-selector-button]`
      const statusSelector = `[data-item='${contact._id}'] [data-id=contact-status-${status}]`

      this
        .waitForElementVisible(buttonSelector)
        .click(buttonSelector)
        .waitForElementVisible(statusSelector)
        .click(statusSelector)
        .waitForElementNotVisible(statusSelector)

      return this
    },
    isInResults: function (contact) {
      this.assert.elementPresent(`[data-id=contact-link][data-contact='${contact._id}']`)
    },
    isNotInResults: function (contact) {
      this.assert.elementNotPresent(`[data-id=contact-link][data-contact='${contact._id}']`)
    },
    assertInSearchResults: function (contact) {
      const selector = `[data-item='${contact._id}']`

      this.assert.visible(selector)

      return this
    },
    assertNotInSearchResults: function (contact) {
      const selector = `[data-item='${contact._id}']`

      this.assert.elementNotPresent(selector)

      return this
    },
    assertNoResults: function () {
      this.assert.visible('@noResults')

      return this
    }
  }]
}
