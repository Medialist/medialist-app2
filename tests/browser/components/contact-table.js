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
        .clearSlow('@searchInput')
        .waitForElementVisible('@unfilteredList')
        .setValue('@searchInput', query)
        .waitForElementVisible('@searchResults')

      return this
    },
    searchForWithoutFinding: function (query) {
      this
        .waitForElementVisible('@searchInput')
        .clearSlow('@searchInput')
        .waitForElementVisible('@unfilteredList')
        .setValue('@searchInput', query)
        .waitForElementVisible('@noResults')

      return this
    },
    selectRow: function (index) {
      const rowSelector = `[data-id=contacts-table-row-${index}]`
      const checkboxSelector = `[data-id=contacts-table-row-${index}-checkbox-label]`

      this
        .waitForElementVisible(rowSelector)
        .moveToElement(rowSelector, 10, 10)
        .waitForElementVisible(checkboxSelector)
        .click(checkboxSelector)

      return this
    },
    getContactSlugAt: function (index, cb) {
      const rowSelector = `[data-id=contacts-table-row-${index}]`
      this
        .waitForElementVisible(rowSelector)

      this.getAttribute(rowSelector, 'data-item', (res) => cb(res.value))
    },
    clickRow: function (index) {
      const selector = `[data-id=contacts-table-row-${index}] [data-id=contact-link]`

      this
        .waitForElementVisible(selector)
        .click(selector)
        .waitForElementNotPresent(selector)

      return this
    },
    clickContact: function (contact) {
      const selector = `[data-item=${contact.slug}] [data-id=contact-link]`

      this
        .waitForElementVisible(selector)
        .click(selector)
        .waitForElementNotPresent(selector)

      return this
    },
    updateStatus: function (contact, status) {
      const buttonSelector = `[data-item='${contact.slug}'] [data-id=contact-status-selector-button]`
      const statusSelector = `[data-item='${contact.slug}'] [data-id=contact-status-${status}]`

      this
        .waitForElementVisible(buttonSelector)
        .click(buttonSelector)
        .waitForElementVisible(statusSelector)
        .click(statusSelector)
        .waitForElementNotVisible(statusSelector)

      return this
    },
    isInResults: function (contact) {
      const selector = `[data-id=contact-link][data-contact='${contact.slug}']`
      this.waitForElementPresent(selector)
      this.assert.elementPresent(selector)
    },
    isNotInResults: function (contact) {
      this.assert.elementNotPresent(`[data-id=contact-link][data-contact='${contact.slug}']`)
    },
    assertInSearchResults: function (contact) {
      const selector = `[data-item='${contact.slug}']`

      this.waitForElementVisible(selector)
      this.assert.visible(selector)

      return this
    },
    assertNotInSearchResults: function (contact) {
      const selector = `[data-item='${contact.slug}']`

      this.assert.elementNotPresent(selector)

      return this
    },
    assertNoResults: function () {
      this.waitForElementVisible('@noResults')
      this.assert.visible('@noResults')

      return this
    },
    assertInPosition: function (contact, index) {
      const selector = `[data-id=contacts-table-row-${index}][data-item='${contact.slug}']`

      this.waitForElementVisible(selector)
      this.assert.visible(selector)

      return this
    },
    assertContactIsHighlighted: function (contact) {
      const selector = `[data-item=${contact.slug}][data-highlight=true]`
      this.waitForElementVisible(selector)
      this.assert.visible(selector)
      return this
    },
    assertIndexIsHighlighted: function (index) {
      const selector = `[data-id=contacts-table-row-${index}][data-highlight=true]`

      this.waitForElementVisible(selector)
      this.assert.visible(selector)

      return this
    },
    sortBy: function (propName, dir, cb) {
      const self = this
      const selector = `[data-id=sort-by-${propName}]`
      this.waitForElementVisible(selector)
      this.getAttribute(selector, 'data-dir', function (res) {
        const currentDir = parseInt(res.value)
        if (currentDir === dir) return cb(null, self)
        // Dir isn't what we want yet so click it and try again.
        self.click(selector)
        self.sortBy(propName, dir, cb)
      })
    }
  }]
}
