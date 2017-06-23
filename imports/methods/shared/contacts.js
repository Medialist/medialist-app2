import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import Contacts from '/imports/api/contacts/contacts'

Meteor.methods({
  'contacts/toggle-favourite': function (contactSlug) {
    if (!this.userId) {
      throw new Meteor.Error('Only a logged-in user can (un)favourite a campaign')
    }

    const user = Meteor.users.findOne(this.userId, { fields: { myContacts: 1 } })
    check(contactSlug, String)
    const contactRef = Contacts.findOneRef(contactSlug)

    if (!contactRef) {
      throw new Meteor.Error('Cannot find contact')
    }

    if (user.myContacts.some((c) => c._id === contactRef._id)) {
      Meteor.users.update(this.userId, {
        $pull: {
          myContacts: {
            _id: contactRef._id
          }
        }
      })

      return false
    }

    Meteor.users.update(this.userId, {
      $push: {
        myContacts: contactRef
      }
    })

    return true
  }
})
