'use strict'

const editCampaignForm = require('../forms/edit-campaign-form')

module.exports = {
  url: 'http://localhost:3000/campaigns',
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
    activity: {
      selector: '[data-id=activity-feed]',
      elements: {
        feedbackPost: '[data-id=feedback-post] [data-id=post-text]',
        coveragePost: '[data-id=coverage-post] [data-id=post-text]',
        needToKnowPost: '[data-id=need-to-know-post] [data-id=post-text]',
        statusUpdatePost: '[data-id=status-update] [data-id=post-text]',
        addContactsToCampaignPost: '[data-id=add-contacts-to-campaign] [data-id=post-text]',
        createCampaignPost: '[data-id=create-campaign] [data-id=post-text]'
      }
    },
    editCampaignForm: editCampaignForm,
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
    }
  }]
}
