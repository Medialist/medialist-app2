'use strict'

module.exports = {
  selector: '[data-id=edit-campaign-form]',
  elements: {
    campaignNameInput: '[data-id=campaign-name-input]',
    clientInput: '[data-id=client-input]',
    keyMessageInput: '[data-id=key-message-input]',
    addLinkButton: '[data-id=add-link-button]',
    submitButton: '[data-id=save-campaign-button]',
    cancelButton: '[data-id=edit-campaign-form-cancel-button]',
    deleteButton: '[data-id=delete-campaign-button]',
    confirmDeleteButton: '[data-id=confirm-delete-campaign-button]',
    cancelDeleteButton: '[data-id=cancel-delete-campaign-button]'
  },
  commands: [{
    verifyEditFormContents: function (campaign) {
      this.assert.attributeEquals('@campaignNameInput', 'value', campaign.name)
      this.assert.attributeEquals('@clientInput', 'value', campaign.clientName || campaign.client.name)
      this.assert.attributeEquals('@keyMessageInput', 'value', campaign.purpose)

      campaign.links.forEach((link, index) => {
        this.assert.attributeEquals(`[data-id=link-input-${index}]`, 'value', link.url)
      })

      return this
    },
    populate: function (campaign) {
      this.clear(`@campaignNameInput`)
      this.setValue(`@campaignNameInput`, campaign.name)

      this.clear(`@clientInput`)
      this.setValue(`@clientInput`, campaign.clientName)

      this.clear(`@keyMessageInput`)
      this.setValue(`@keyMessageInput`, campaign.purpose)

      campaign.links.forEach((link, index) => {
        const input = `[data-id=link-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addLinkButton')
            this.click(`@addLinkButton`)
            this.waitForElementVisible(input)
          })
        }

        this.clear(input)
        this.setValue(input, link.url)
      })

      return this
    },
    submit: function () {
      this.click('@submitButton')

      this.waitForElementNotPresent(this.selector)
    },
    cancel: function () {
      this.click('@cancelButton')

      this.waitForElementNotPresent(this.selector)

      return this
    },
    openDeleteConfirmation: function () {
      this.waitForElementPresent('@deleteButton')
      this.click('@deleteButton')

      this.waitForElementPresent('@confirmDeleteButton')

      return this
    },
    confirmDeletion: function () {
      this.waitForElementPresent('@confirmDeleteButton')
      this.click('@confirmDeleteButton')

      this.waitForElementNotPresent(this.selector)

      return this
    },
    cancelDeletion: function () {
      this.waitForElementPresent('@cancelDeleteButton')
      this.click('@cancelDeleteButton')

      this.waitForElementNotPresent('@cancelDeleteButton')

      return this
    }
  }]
}
