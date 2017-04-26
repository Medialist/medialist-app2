'use strict'

module.exports = {
  selector: '[data-id=edit-campaign-form]',
  elements: {
    campaignNameInput: '[data-id=campaign-name-input]',
    clientInput: '[data-id=client-input]',
    keyMessageInput: '[data-id=key-message-input]',
    addLinkButton: '[data-id=add-link-button]',
    submitButton: '[data-id=save-campaign-button]'
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
      this.clearValue(`@campaignNameInput`)
      this.setValue(`@campaignNameInput`, campaign.name)

      this.clearValue(`@clientInput`)
      this.setValue(`@clientInput`, campaign.clientName)

      this.clearValue(`@keyMessageInput`)
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

        this.clearValue(input)
        this.setValue(input, link.url)
      })

      return this
    },
    submit: function () {
      this.click('@submitButton')

      this.waitForElementNotPresent(this.selector)
    }
  }]
}
