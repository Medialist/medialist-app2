'use strict'

module.exports = {
  selector: '[data-id=campaign-selector-modal]',
  elements: {
    searchInput: '[data-id=search-input]',
    searchResults: '[data-id=search-results]',
    addButton: '[data-id=add-button]'
  },
  commands: [{
    searchForCampaign: function (campaign) {
      this.waitForElementVisible('@searchInput')
      this.clear('@searchInput')
      this.setValue('@searchInput', campaign.name)

      this.waitForElementVisible('@searchResults')

      return this
    },
    selectSearchResult: function (campaign) {
      this.waitForElementPresent('@addButton')
      this.moveToElement('@addButton', 1, 1)
      this.waitForElementVisible('@addButton')
      this.click('@addButton')

      this.waitForElementNotPresent(this.selector)

      return this
    }
  }]
}
