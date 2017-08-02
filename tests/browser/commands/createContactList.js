const domain = require('../fixtures/domain')

exports.command = function createCampaignList (callback) {
  const contactList = domain.contactList()

  this.perform((done) => {
    this.ddp.client.call('MasterLists/create', [ contactList ], (error, id) => {
      if (error) {
        console.error(error)
        throw error
      }

      this.db.findContactList({
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
