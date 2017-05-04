
exports.command = function tagCampaigns (campaigns, tags, callback) {
  this.perform((done) => {
    this.ddp.client.call('Tags/batchAddTags', [ {
      type: 'Campaigns',
      slugs: campaigns.map(campaign => campaign.slug),
      names: tags
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
