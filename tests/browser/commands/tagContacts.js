
exports.command = function tagContacts (contacts, tags, callback) {
  this.perform((done) => {
    this.ddp.client.call('Tags/batchAddTags', [ {
      type: 'Contacts',
      slugs: contacts.map(contact => contact.slug),
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
