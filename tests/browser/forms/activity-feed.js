'use strict'

module.exports = {
  selector: '[data-id=activity-feed]',
  elements: {
    addContactsToCampaignPost: '[data-id=add-contacts-to-campaign]'
  },
  commands: [{
    assertHasAddContactToCampaignPostWithText: function (contact, campaign, text) {
      const selector = `[data-id=add-contacts-to-campaign][data-contact~=${contact._id}][data-campaign~=${campaign._id}]`

      this.waitForElementPresent(selector)
        .assert.containsText(selector, text)

      return this
    }
  }]
}
