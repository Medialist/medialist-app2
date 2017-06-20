
exports.command = function tagContact (contact, tags, callback) {
  this.perform((done) => {
    this.ddp.client.call('Tags/set', [ {
      type: 'Contacts',
      _id: contact._id,
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
