'use strict'

const editContactForm = require('../components/edit-contact-form')
const activityFeed = require('../components/activity-feed')
const postBox = require('../components/post-box')
const campaignSelectorModal = require('../components/campaign-selector-modal')
const addToListsModal = require('../components/add-to-lists-modal')
const tagSelectorModal = require('../components/tag-selector-modal')

module.exports = {
  url: function () {
    return this.api.launchUrl + '/contacts'
  },
  elements: {
    contactInfo: '[data-id=contact-info]',
    openPostMenuButton: '[data-id=open-post-menu-button]',
    editPostButton: '[data-id=edit-post-button]',
    createPostButton: '[data-id=create-post-button]',
    addToFavouritesButton: '[data-id=add-to-my-contacts-button]',
    removeFromFavouritesButton: '[data-id=remove-from-my-contacts-button]'
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
    editPostModal: {
      selector: '[data-id=edit-post-modal]',
      elements: {
        feedbackInput: '[data-id=feedback-input]',
        coverageInput: '[data-id=coverage-input]',
        needToKnowInput: '[data-id=need-to-know-input]',
        createPostButton: '[data-id=create-post-button]',
        contactStatusSelectorButton: '[data-id=contact-status-selector-button]'
      }
    },
    activityFeed: activityFeed('contact'),
    postBox: postBox,
    contactListsModal: addToListsModal('add-to-list-modal'),
    tagSelectorModal: tagSelectorModal('tag-selector-modal')
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
    },
    addNeedToKnowPost: function (contact, text) {
      this.section.postBox
        .postNeedToKnow(contact, text)
      return this
    },
    editNeedToKnowPost: function (contact, text) {
      this
        .waitForElementVisible('@openPostMenuButton')
        .click('@openPostMenuButton')
        .waitForElementVisible('@editPostButton')
        .click('@editPostButton')
        .waitForElementVisible(this.section.editPostModal.selector)

      this.section.editPostModal
        .clear('@needToKnowInput')
        .setValue('@needToKnowInput', text)
        .waitForElementVisible('@createPostButton')
        .click('@createPostButton')

      return this
    },
    favouriteContact: function () {
      return this
        .waitForElementVisible('@addToFavouritesButton')
        .click('@addToFavouritesButton')
    },
    unFavouriteContact: function () {
      return this
        .waitForElementVisible('@removeFromFavouritesButton')
        .click('@removeFromFavouritesButton')
    }
  }]
}
