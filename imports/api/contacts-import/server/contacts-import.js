import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { check } from 'meteor/check'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import slugify from '/imports/lib/slug'
import { findOneUserRef } from '/imports/api/users/users'
import ContactsTask from '/imports/api/twitter-users/server/contacts-task'
import Contacts, { ContactSchema, ContactCreateSchema } from '/imports/api/contacts/contacts'
import ContactsImport from '../contacts-import'

export const importContacts = new ValidatedMethod({
  name: 'importContacts',

  validate: new SimpleSchema({
    data: { type: [ContactCreateSchema] }
  }).validator(),

  run ({ data }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    console.log(`Importing ${data.length} contacts`)

    const createdBy = findOneUserRef(this.userId)
    const createdAt = new Date()
    const doc = {
      createdAt,
      createdBy,
      data,
      results: {
        created: [],
        updated: [],
        failed: []
      }
    }
    const _id = ContactsImport.insert(doc)
    // Do after sending the clint the import _id
    Meteor.defer(function () {
      processImport({_id, ...doc})
    })
    return _id
  }
})

function processImport (doc) {
  // // Look for existing contacts based on email address.
  // const emails = flatten(
  //   doc.data.map((item) => item.emails.map((e) => e.value))
  //
  // const existingContacts = Contacts.find({'emails.value': {$in: emails}})
  const {data, createdBy} = doc
  data.forEach((contactData, i) => {
    if (contactData.emails && contactData.emails.length) {
      var emails = contactData.emails.map(e => e.value)
      var contact = Contacts.findOne({'emails.value': {$in: emails}})
      if (contact) {
        mergeContact(contactData, contact, createdBy, doc._id)
      } else {
        createContact(contactData, createdBy, doc._id)
      }
    } else {
      createContact(contactData, createdBy, doc._id)
    }
  })
}

function createContact (data, userRef, importId) {
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
  ContactsImport.update({_id: importId}, {$push: {'results.created': id}})
  ContactsTask.queueUpdate(id)
}

function mergeContact (data, contact, userRef, importId) {
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
  ContactsImport.update({_id: importId}, {$push: {'results.updated': id}})
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
