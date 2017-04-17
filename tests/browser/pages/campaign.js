'use strict'

const editCampaignForm = require('../forms/edit-campaign-form')
const activityFeed = require('../forms/activity-feed')
const postBox = require('../forms/post-box')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    addContactsButton: '[data-id=add-contacts-to-campaign-button]'
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
        editCampaignMasterListsButton: '[data-id=edit-campaign-master-lists-button]',
        editCampaignTagsButton: '[data-id=edit-campaign-tags-button]'
      }
    },
    editCampaignForm: editCampaignForm,
    activityFeed: activityFeed('campaign'),
    postBox: postBox,
    editTeamMembersForm: {
      selector: '[data-id=edit-campaign-team-modal]',
      elements: {
        searchInput: '[data-id=search-team-mates-input]',
        searchResults: '[data-id=team-mates-table-search-results]',
        unfilteredList: '[data-id=team-mates-table-unfiltered]',
        addButton: '[data-id=add-button]',
        selectedButton: '[data-id=selected-button]',
        cancelButton: '[data-id=edit-campaign-team-cancel-button]',
        saveButton: '[data-id=edit-campaign-team-submit-button]'
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
            .clearValue('@searchInput')
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
        .clearValue('@searchInput')
        .setValue('@searchInput', user.profile.name)
        .waitForElementVisible('@searchResults')
        .waitForElementPresent('@addButton')
        .moveToElement('@addButton', 1, 1)
        .waitForElementVisible('@addButton')
        .click('@addButton')

      return this
    },
    removeFromTeam: function (user) {
      this.section.editTeamMembersForm
        .waitForElementVisible('@searchInput')
        .clearValue('@searchInput')
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
    }
  }]
}
