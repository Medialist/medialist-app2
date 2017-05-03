
exports.command = function addCampiangsToCampaignLists (campaigns, campaignLists, callback) {
  this.perform((done) => {
    this.ddp.client.call('batchAddToMasterLists', [ {
      type: 'Campaigns',
      slugs: campaigns.map(campaign => campaign.slug),
      masterListIds: campaignLists.map(list => list._id)
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
