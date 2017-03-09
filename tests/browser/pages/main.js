'use strict'

module.exports = {
  url: 'http://localhost:3000/',
  elements: {
    campaignsTab: '#campaigns-tab',
    contactsTab: '#contacts-tab'
  },
  commands: [{
    navigateToCampaigns: function (t) {
      this
        .waitForElementVisible('@campaignsTab')
        .click('@campaignsTab')

      return t.page.campaigns()
    },
    navigateToContacts: function (t) {
      this
        .waitForElementVisible('@contactsTab')
        .click('@contactsTab')

      return t.page.contacts()
    }
  }]
}
