'use strict'

const editCampaignForm = require('../components/edit-campaign-form')
const activityFeed = require('../components/activity-feed')
const postBox = require('../components/post-box')
const addToListsModal = require('../components/add-to-lists-modal')
const tagSelectorModal = require('../components/tag-selector-modal')
const findUrl = require('../../../imports/lib/find-url')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    addContactsButton: '[data-id=add-contacts-to-campaign-button]',
    createPostButton: '[data-id=create-post-button]',
    feedbackInput: '[data-id=feedback-input]',
    selectContactButton: '[data-id=select-contact-button]',
    openPostMenuButton: '[data-id=open-post-menu-button]',
    editPostButton: '[data-id=edit-post-button]',
    addToFavouritesButton: '[data-id=add-to-my-campaigns-button]',
    removeFromFavouritesButton: '[data-id=remove-from-my-campaigns-button]'
  },
  sections: {
    info: {
      selector: '[data-id=campaign-details]',
      elements: {
        title: '[data-id=campaign-name]',
        client: '[data-id=campaign-client]',
        keyMessage: '[data-id=campaign-key-message]',
        link0: '[data-id=campaign-link-0]',
        link1: '[data-id=campaign-link-1]',
        link2: '[data-id=campaign-link-2]',
        teamMembers: '[data-id=campaign-team-members]',
        masterLists: '[data-id=campaign-master-lists]',
        tags: '[data-id=campaign-tags]',
        editCampaignInfoButton: '[data-id=edit-campaign-info-button]',
        editCampaignTeamMembersButton: '[data-id=edit-campaign-team-members-button]',
        editCampaignMasterListsButton: '[data-id=edit-campaign-campaign-lists-button]',
        editCampaignTagsButton: '[data-id=edit-campaign-tags-button]'
      }
    },
    editCampaignForm: editCampaignForm,
    activityFeed: activityFeed('campaign'),
    postBox: postBox,
    campaignListsModal: addToListsModal('add-to-list-modal'),
    tagSelectorModal: tagSelectorModal('tag-selector-modal'),
    editTeamMembersForm: {
      selector: '[data-id=edit-campaign-team-modal]',
      elements: {
        emailInput: '[data-id=invite-by-email-input]',
        searchInput: '[data-id=search-team-mates-input]',
        searchResults: '[data-id=team-mates-table-search-results]',
        unfilteredList: '[data-id=team-mates-table-unfiltered]',
        addButton: '[data-id=add-button]',
        selectedButton: '[data-id=selected-button]',
        cancelButton: '[data-id=edit-campaign-team-cancel-button]',
        saveButton: '[data-id=edit-campaign-team-submit-button]'
      }
    },
    editPostModal: {
      selector: '[data-id=edit-post-modal]',
      elements: {
        feedbackInput: '[data-id=feedback-input]',
        coverageInput: '[data-id=coverage-input]',
        needToKnowInput: '[data-id=need-to-know-input]',
        createPostButton: '[data-id=create-post-button]',
        contactStatusSelectorButton: '[data-id=contact-status-selector-button]',
        selectContactButton: '[data-id=select-contact-button]'
      },
      sections: {
        dropdownMenu: {
          selector: '[data-id=dropdown-menu]',
          elements: {
            campaignContactSearchResult: '[data-type=campaign-contact-search-result]'
          },
          commands: [
            {
              selectContact: function (contact) {
                const selector = `[data-id=edit-post-modal] [data-id=campaign-contact-${contact.slug}]`

                this
                  .waitForElementVisible(selector)
                  .click(selector)
                return this
              }
            },
            {
              selectStatus: function (status) {
                const selector = `[data-id=edit-post-modal] [data-id=contact-status-${status}]`

                this
                  .waitForElementVisible(selector)
                  .click(selector)
                return this
              }
            }
          ]
        }
      }
    },
    addContactsModal: {
      selector: '[data-id=add-contacts-to-campaign-modal]',
      elements: {
        searchInput: '[data-id=search-contacts-input]',
        searchResults: '[data-id=contacts-table-search-results]',
        unfilteredList: '[data-id=contacts-table-unfiltered]',
        addButton: '[data-id=add-button]',
        removeButton: '[data-id=remove-button]',
        selectedButton: '[data-id=selected-button]',
        cancelButton: '[data-id=cancel-button]',
        saveButton: '[data-id=save-button]'
      },
      commands: [{
        add: function (contact) {
          this
            .waitForElementVisible('@searchInput')
            .clear('@searchInput')
            .setValue('@searchInput', contact.name)
            .waitForElementVisible('@searchResults')
            .waitForElementPresent('@addButton')
            .moveToElement('@addButton', 1, 1)
            .waitForElementVisible('@addButton')
            .click('@addButton')

          return this
        },
        save: function () {
          this
            .waitForElementVisible('@saveButton')
            .click('@saveButton')

          this.waitForElementNotPresent(this.selector)

          return this
        },
        cancel: function () {
          this
            .waitForElementVisible('@cancelButton')
            .click('@cancelButton')

          this.waitForElementNotPresent(this.selector)

          return this
        },
        addFeedbackPost: function () {
          this.section.postBox
            .postFeedbackMessage('test')
          return this
        }
      }]
    },
    campaignContacts: {
      selector: '[data-id=campaign-contact-list]',
      elements: {
        manageContactsLink: '[data-id=manage-contacts]'
      },
      commands: [{
        updateStatus: function (contact, status) {
          const openStatusDropdownButton = `[data-contact='${contact.slug}'] [data-id=contact-status-selector-button]`
          const statusButton = `[data-contact='${contact.slug}'] [data-id=contact-status-${status}]`

          this
            .waitForElementVisible(openStatusDropdownButton)
            .click(openStatusDropdownButton)
            .waitForElementVisible(statusButton)
            .click(statusButton)

          this.waitForElementNotVisible(statusButton)

          return this
        }
      }]
    }
  },
  commands: [{
    navigate: function (campaign) {
      this.api.url('http://localhost:3000/campaign/' + campaign.slug)
      this.waitForElementVisible(this.section.info.selector)

      return this
    },
    editCampaign: function () {
      this.section.info
        .waitForElementVisible('@editCampaignInfoButton')
        .click('@editCampaignInfoButton')
        .waitForElementVisible(this.section.editCampaignForm.selector)

      return this
    },
    editTeam: function () {
      this.section.info
        .waitForElementVisible('@editCampaignTeamMembersButton')
        .click('@editCampaignTeamMembersButton')

      this.waitForElementVisible(this.section.editTeamMembersForm.selector)

      return this
    },
    addToTeam: function (user) {
      this.section.editTeamMembersForm
        .waitForElementVisible('@searchInput')
        .clear('@searchInput')
        .setValue('@searchInput', user.profile.name)
        .waitForElementVisible('@searchResults')
        .waitForElementPresent('@addButton')
        .moveToElement('@addButton', 1, 1)
        .waitForElementVisible('@addButton')
        .click('@addButton')

      return this
    },
    addToTeamByEmail: function (email) {
      this.section.editTeamMembersForm
        .waitForElementVisible('@emailInput')
        .clear('@emailInput')
        .setValue('@emailInput', email)

      return this
    },
    removeFromTeam: function (user) {
      this.section.editTeamMembersForm
        .waitForElementVisible('@searchInput')
        .clear('@searchInput')
        .setValue('@searchInput', user.profile.name)
        .waitForElementVisible('@searchResults')
        .waitForElementPresent('@selectedButton')
        .moveToElement('@selectedButton', 1, 1)
        .waitForElementVisible('@selectedButton')
        .click('@selectedButton')

      return this
    },
    cancelTeamEdit: function () {
      this.section.editTeamMembersForm
        .waitForElementVisible('@cancelButton')
        .click('@cancelButton')

      this.waitForElementNotPresent(this.section.editTeamMembersForm.selector)

      return this
    },
    saveTeamEdit: function () {
      this.section.editTeamMembersForm
        .waitForElementVisible('@saveButton')
        .click('@saveButton')

      this.waitForElementNotPresent(this.section.editTeamMembersForm.selector)

      return this
    },
    openAddContactsModal: function () {
      this
        .waitForElementVisible('@addContactsButton')
        .click('@addContactsButton')

      this.waitForElementVisible(this.section.addContactsModal.selector)

      return this
    },
    openEditPostModal: function () {
      this
        .waitForElementVisible('@openPostMenuButton')
        .click('@openPostMenuButton')
        .waitForElementVisible('@editPostButton')
        .click('@editPostButton')
        .waitForElementVisible(this.section.editPostModal.selector)

      return this
    },
    addFeedbackPost: function (contact, contactStatus, text) {
      this.section.postBox
        .postFeedback(contact, contactStatus, text)
      return this
    },
    editFeedbackPost: function (contact, contactStatus, text) {
      this
        .waitForElementVisible('@openPostMenuButton')
        .click('@openPostMenuButton')
        .waitForElementVisible('@editPostButton')
        .click('@editPostButton')
        .waitForElementVisible(this.section.editPostModal.selector)

      this.section.editPostModal
        .waitForElementVisible('@selectContactButton')
        .click('@selectContactButton')

      this.section.editPostModal.section.dropdownMenu
        .waitForElementVisible('@campaignContactSearchResult')
        .selectContact(contact)

      this.section.editPostModal
        .waitForElementVisible('@contactStatusSelectorButton')
        .click('@contactStatusSelectorButton')

      this.section.editPostModal.section.dropdownMenu
        .selectStatus(contactStatus)

      this.section.editPostModal
        .waitForElementVisible('@feedbackInput')
        .setValue('@feedbackInput', text)
        .waitForElementVisible('@createPostButton')
        .click('@createPostButton')
        .waitForElementNotPresent('@createPostButton')

      return this
    },
    addCoveragePost: function (contact, contactStatus, text, embed) {
      this.section.postBox
        .postCoverage(contact, contactStatus, text)
      return this
    },
    editCoveragePost: function (contact, contactStatus, text) {
      this
        .waitForElementVisible('@openPostMenuButton')
        .click('@openPostMenuButton')
        .waitForElementVisible('@editPostButton')
        .click('@editPostButton')
        .waitForElementVisible(this.section.editPostModal.selector)

      this.section.editPostModal
        .waitForElementVisible('@coverageInput')
        .clear('@coverageInput')
        .setValue('@coverageInput', text)

      const url = findUrl(text)

      if (url) {
        this.section.editPostModal
          .waitForElementVisible(`[href='${url}'][data-id=link-preview]`)
      }

      this.section.editPostModal
        .waitForElementVisible('@createPostButton')
        .click('@createPostButton')

      return this
    },
    favouriteCampaign: function () {
      return this
        .waitForElementVisible('@addToFavouritesButton')
        .click('@addToFavouritesButton')
    },
    unFavouriteCampaign: function () {
      return this
        .waitForElementVisible('@removeFromFavouritesButton')
        .click('@removeFromFavouritesButton')
    }
  }]
}
