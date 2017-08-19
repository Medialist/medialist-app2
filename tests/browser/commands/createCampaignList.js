const domain = require('../fixtures/domain')

exports.command = function createCampaignList (callback) {
  const campaignList = domain.campaignList()

  this.perform((done) => {
    this.ddp.client.call('MasterLists/create', [ campaignList ], (error, id) => {
      if (error) {
        console.error(error)
        throw error
      }

      this.db.findCampaignList({
        _id: id
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
