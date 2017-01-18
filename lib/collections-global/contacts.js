import Contacts, { ContactSchema } from '/imports/api/contacts/contacts'

// <Legacy compat>
if (Meteor.isServer) {
  global.Contacts = Contacts
} else {
  window.Contacts = Contacts
}

Schemas.Contacts = ContactSchema
// </Legacy compat>
