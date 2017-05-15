
exports.command = function createCampaignInvitationLink (email, campaign, callback) {
  this.perform((done) => {
    this.ddp.client.call('Campaigns/createInvitationLink', [ {
      email: email,
      _id: campaign._id
    } ], (error, link) => {
      if (error) {
        throw error
      }

      callback(link)
      done()
    })
  })

  return this
}
