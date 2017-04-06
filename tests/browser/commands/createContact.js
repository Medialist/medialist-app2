const domain = require('../fixtures/domain')

exports.command = function createContact (callback) {
  const contact = domain.contact()

  this.perform((done) => {
    this.ddp.client.call('createContact', [ { details: contact } ], (error, id) => {
      if (error) {
        console.error(error)
        throw error
      }

      this.db.findContact({
        _id: id
      })
      .then((doc) => {
        callback(doc)
        done()
      })
    })
  })

  return this
}
