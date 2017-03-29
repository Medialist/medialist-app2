'use strict'

module.exports = {
  url: 'http://localhost:3000/settings',
  elements: {
    profileSettingsButton: '#profile-settings-button',
    campaignListsButton: '#campaign-lists-button',
    contactListsButton: '#contact-lists-button'
  },
  sections: {
    profile: {
      selector: '#profile-settings-panel',
      elements: {
        nameField: 'input[name=name]',
        emailField: 'input[name=email]',
        updateProfileButton: '#update-profile-button'
      }
    }
  },
  commands: [{

  }]
}
