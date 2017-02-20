import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import Contacts from '/imports/api/contacts/contacts'

Meteor.methods({
  'contacts/toggle-favourite': function (contactSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can (un)favourite a medialist')
    const user = Meteor.users.findOne(this.userId, { fields: { myContacts: 1 } })
    check(contactSlug, String)
    const contact = Contacts.findOne({ slug: contactSlug }, { fields: { avatar: 1, slug: 1, name: 1, outlets: 1 } })
    if (!contact) throw new Meteor.Error('Cannot find contact')

    if (user.myContacts.some((c) => c._id === contact._id)) {
      return Meteor.users.update(this.userId, { $pull: { myContacts: { _id: contact._id } } })
    }
    return Meteor.users.update(this.userId, { $push: { myContacts: {
      _id: contact._id,
      name: contact.name,
      slug: contact.slug,
      avatar: contact.avatar,
      outlets: contact.outlets,
      updatedAt: new Date()
    } } })
  }
})
