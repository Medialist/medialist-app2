
exports.command = function tagCampaign (campaign, tags, callback) {
  this.perform((done) => {
    this.ddp.client.call('Tags/set', [ {
      type: 'Campaigns',
      _id: campaign._id,
      tags: tags
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
