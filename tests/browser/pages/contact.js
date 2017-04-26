'use strict'

const editContactForm = require('../components/edit-contact-form')
const activityFeed = require('../components/activity-feed')
const postBox = require('../components/post-box')
const campaignSelectorModal = require('../components/campaign-selector-modal')

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    contactInfo: '[data-id=contact-info]'
  },
  sections: {
    info: {
      selector: '[data-id=contact-info]',
      elements: {
        editContactInfoButton: '[data-id=edit-contact-info-button]',
        editContactCampaignsButton: '[data-id=edit-contact-campaigns-button]',
        editContactMasterListsButton: '[data-id=edit-contact-contact-lists-button]',
        editContactTagsButton: '[data-id=edit-contact-tags-button]'
      }
    },
    campaignSelectorModal: campaignSelectorModal,
    editContactForm: editContactForm,
    activityFeed: activityFeed('contact'),
    postBox: postBox
  },
  commands: [{
    navigate: function (contact) {
      this.api.url('http://localhost:3000/contact/' + contact.slug)
      this.waitForElementVisible(this.section.info.selector)

      return this
    },
    editContact: function () {
      this.section.info
        .waitForElementVisible('@editContactInfoButton')
        .click('@editContactInfoButton')
        .waitForElementVisible(this.section.editContactForm.selector)

      return this
    }
  }]
}
