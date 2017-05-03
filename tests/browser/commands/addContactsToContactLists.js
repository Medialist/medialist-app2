
exports.command = function addContactsToContactLists (contacts, contactLists, callback) {
  this.perform((done) => {
    this.ddp.client.call('batchAddToMasterLists', [ {
      type: 'Contacts',
      slugs: contacts.map(contact => contact.slug),
      masterListIds: contactLists.map(list => list._id)
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
