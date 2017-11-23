'use strict'

module.exports = {
  url: function () {
    return this.api.launchUrl
  },
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
    logout: function () {
      this
        .waitForElementVisible('@userInfoMenu')
        .click('@userInfoMenu')
        .waitForElementVisible('@logOutLink')
        .click('@logOutLink')
    },
    waitForSnackbarMessage: function (type) {
      this.waitForElementVisible(`[data-id=snackbar] [data-id=snackbar-message][data-message-type=${type}]`)
    }
  }]
}
