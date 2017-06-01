import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { check } from 'meteor/check'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import slugify from '/imports/lib/slug'
import { findOneUserRef } from '/imports/api/users/users'
import ContactsTask from '/imports/api/twitter-users/server/contacts-task'
import Contacts, { ContactSchema, ContactCreateSchema } from '/imports/api/contacts/contacts'

// TODO: reafactor to return _ids of created and updated users, so we can do batch actions on them. Or use the tag?

export const importContacts = new ValidatedMethod({
  name: 'importContacts',

  validate: new SimpleSchema({
    contacts: { type: [ContactCreateSchema] }
  }).validator(),

  run ({ contacts }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    var userRef = findOneUserRef(this.userId)

    console.log(`Importing ${contacts.length} contacts`)

    var results = {created: 0, updated: 0}

    // Look for existing contacts based on email address.
    contacts.forEach(contactData => {
      if (contactData.emails && contactData.emails.length) {
        var emails = contactData.emails.map(e => e.value)
        var contact = Contacts.findOne({'emails.value': {$in: emails}})

        if (contact) {
          mergeContact(contactData, contact, userRef)
          results.updated++
        } else {
          createContact(contactData, userRef)
          results.created++
        }
      } else {
        createContact(contactData, userRef)
        results.created++
      }
    })
    results.total = results.created + results.updated
    return results
  }
})

function createContact (data, userRef) {
  data.slug = slugify(data.name, Contacts)
  data.socials = data.socials || []
  data.phones = data.phones || []
  data.campaigns = []
  data.masterLists = []
  data.tags = []
  data.createdAt = new Date()
  data.createdBy = userRef
  data.updatedAt = data.createdAt
  data.updatedBy = data.createdBy

  check(data, ContactSchema)

  var id = Contacts.insert(data)
  ContactsTask.queueUpdate(id)
}

function mergeContact (data, contact, userRef) {
  contact.emails = addIfDistinct('value', contact.emails, data.emails)
  contact.phones = addIfDistinct('value', contact.phones, data.phones)
  contact.outlets = addIfDistinct('label', contact.outlets, data.outlets)
  contact.socials = addIfDistinct('label', contact.socials, data.socials)
  contact.addresses = addIfCurrentlyEmpty(contact.addresses, data.addresses)
  contact.createdAt = moment(contact.createdAt).toDate()
  contact.updatedAt = new Date()
  contact.updatedBy = userRef

  var id = contact._id
  delete contact._id
  check(contact, ContactSchema)

  Contacts.update({_id: id}, {$set: contact})
  ContactsTask.queueUpdate(id)
}

function addIfCurrentlyEmpty (oldList = [], newList = []) {
  if (oldList.length > 0) return oldList
  return oldList.concat(newList)
}

function addIfDistinct (property, oldList = [], newList = []) {
  const newItems = newList.reduce((list, newItem) => {
    var newValue = newItem[property].toLowerCase()
    var exists = oldList.some(oldItem => oldItem[property].toLowerCase() === newValue)
    return exists ? list : list.concat(newItem)
  }, [])
  return oldList.concat(newItems)
}
