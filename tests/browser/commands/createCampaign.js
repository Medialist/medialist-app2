const domain = require('../fixtures/domain')

exports.command = function createCampaign (callback) {
  const campaign = domain.campaign()

  this.perform((done) => {
    this.ddp.client.call('Campaigns/create', [ campaign ], (error, slug) => {
      if (error) {
        throw error
      }

      this.db.findCampaign({
        slug: slug
      })
      .then((doc) => {
        callback(doc)
        done()
      })
      .catch(error => {
        throw error
      })
    })
  })

  return this
}
