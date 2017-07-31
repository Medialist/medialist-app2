const domain = require('../fixtures/domain')

exports.command = function createContact (callback) {
  const contact = domain.contact()

  this.perform((done) => {
    this.ddp.client.call('createContact', [ { details: contact } ], (error, slug) => {
      if (error) {
        console.error(error)
        throw error
      }

      this.db.findContact({
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
