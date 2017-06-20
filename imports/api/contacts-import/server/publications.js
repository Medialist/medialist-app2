import { Meteor } from 'meteor/meteor'
import ContactsImport from '/imports/api/contacts-import/contacts-import'

Meteor.publish('contacts-import', function ({importId}) {
  if (!this.userId) {
    return this.ready()
  }

  return ContactsImport.find({_id: importId})
})
