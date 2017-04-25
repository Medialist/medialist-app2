'use strict'

module.exports = {
  selector: '[data-id=campaigns-table]',
  elements: {
    searchInput: '[data-id=search-campaigns-input]',
    searchResults: '[data-id=campaigns-table-search-results]',
    unfilteredList: '[data-id=campaigns-table-unfiltered]',
    noResults: '[data-id=campaign-table-empty]'
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
    selectRow: function (index) {
      const rowSelector = `[data-id=campaigns-table-row-${index}]`
      const checkboxSelector = `[data-id=campaigns-table-row-${index}-checkbox-label]`

      this
        .moveToElement(rowSelector, 10, 10)
        .waitForElementVisible(checkboxSelector)
        .click(checkboxSelector)

      return this
    },
    clickRow: function (index) {
      const selector = `[data-id=campaigns-table-row-${index}] [data-id=campaign-link]`

      this
        .waitForElementVisible(selector)
        .click(selector)

      return this
    },
    assertInSearchResults: function (campaign) {
      const selector = `[data-item='${campaign._id}']`

      this.assert.visible(selector)

      return this
    },
    assertNotInSearchResults: function (campaign) {
      const selector = `[data-item='${campaign._id}']`

      this.assert.elementNotPresent(selector)

      return this
    },
    assertNoResults: function () {
      this.assert.visible('@noResults')

      return this
    }
  }]
}
