
exports.command = function addContactsToCampaign (contacts, campaign, callback) {
  this.perform((done) => {
    this.ddp.client.call('addContactsToCampaign', [ {
      contactSlugs: contacts.map(contact => contact.slug),
      campaignSlug: campaign.slug
    } ], (error) => {
      if (error) {
        throw error
      }

      callback()
      done()
    })
  })

  return this
}
