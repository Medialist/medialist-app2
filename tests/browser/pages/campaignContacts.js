'use strict'

const contactTable = require('../components/contact-table')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {

  },
  sections: {
    removeContactsConfirmation: {
      selector: '[data-id=remove-contact-from-campaign]',
      elements: {
        confirm: '[data-id=confirm-remove-contact-from-campaign-button]',
        cancel: '[data-id=cancel-remove-contact-from-campaign-button]'
      }
    },
    toast: {
      selector: '[data-id=contact-actions-toast]',
      elements: {
        removeAction: '[data-id=contact-actions-remove]'
      }
    },
    contactTable: contactTable
  },
  commands: [{
    navigate: function (campaign) {
      this.api.url(`http://localhost:3000/campaign/${campaign.slug}/contacts`)
      this.waitForElementVisible(this.section.contactTable.selector)

      return this
    },
    removeContacts: function () {
      this.waitForElementVisible(this.section.toast.selector)

      this.section.toast
        .waitForElementVisible('@removeAction')
        .click('@removeAction')

      this.section.removeContactsConfirmation
        .waitForElementVisible('@confirm')
        .click('@confirm')

      return this
    }
  }]
}
