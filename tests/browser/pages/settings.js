'use strict'

module.exports = {
  url: 'http://localhost:3000/settings',
  elements: {
    profileSettingsButton: '[data-id=profile-settings-button]',
    campaignListsButton: '[data-id=campaign-lists-button]',
    contactListsButton: '[data-id=contact-lists-button]'
  },
  sections: {
    profile: {
      selector: '[data-id=profile-settings-panel]',
      elements: {
        nameField: 'input[name=name]',
        emailField: 'input[name=email]',
        updateProfileButton: '[data-id=update-profile-button]'
      }
    }
  },
  commands: [{

  }]
}
