'use strict'

module.exports = {
  url: 'http://localhost:3000/',
  elements: {
    campaignsTab: '[data-id=campaigns-tab]',
    contactsTab: '[data-id=contacts-tab]',
    userInfoMenu: '[data-id=user-info-menu]',
    logOutLink: '[data-id=logout-link]'
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
    },
    logout: function (t) {
      this
        .waitForElementVisible('@userInfoMenu')
        .click('@userInfoMenu')
        .waitForElementVisible('@logOutLink')
        .click('@logOutLink')
    }
  }]
}
