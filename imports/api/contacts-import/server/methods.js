import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import slugify from '/imports/lib/slug'
import { findOneUserRef } from '/imports/api/users/users'
import Contacts from '/imports/api/contacts/contacts'
import { ContactCreateSchema } from '/imports/api/contacts/schema'
import ContactsImport from '/imports/api/contacts-import/contacts-import'

export const importContacts = new ValidatedMethod({
  name: 'importContacts',

  validate: new SimpleSchema({
    data: {
      type: Array
    },
    'data.$': {
      type: ContactCreateSchema
    }
  }).validator(),

  run ({ data }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const createdBy = findOneUserRef(this.userId)
    const doc = {
      data,
      results: {
        created: [],
        updated: [],
        failed: []
      },
      createdBy,
      createdAt: new Date()
    }

    const _id = ContactsImport.insert(doc)

    // Do after sending the client the import _id
    Meteor.defer(function () {
      const label = `ContactsImport ${_id} with ${data.length} items`
      console.log(label)
      console.time(label)
      processImport({_id, ...doc})
      console.timeEnd(label)
    })

    return _id
  }
})

function processImport (doc) {
  const {data, createdBy} = doc

  data.forEach((contactData, i) => {
    if (contactData.emails && contactData.emails.length) {
      const emails = contactData.emails.map(e => e.value)
      const contact = Contacts.findOne({'emails.value': {$in: emails}})

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

function createContact (data, createdBy, importId) {
  data.slug = slugify(data.name, Contacts)
  data.socials = data.socials || []
  data.phones = data.phones || []
  data.campaigns = []
  data.masterLists = []
  data.tags = []
  data.imports = [importId]
  data.createdBy = createdBy
  data.createdAt = new Date()

  const id = Contacts.insert(data)

  ContactsImport.update({
    _id: importId
  }, {
    $push: {
      'results.created': id
    }
  })
}

function mergeContact (data, contact, createdBy, importId) {
  contact.emails = addIfDistinct('value', contact.emails, data.emails)
  contact.phones = addIfDistinct('value', contact.phones, data.phones)
  contact.outlets = addIfDistinct('label', contact.outlets, data.outlets)
  contact.socials = addIfDistinct('label', contact.socials, data.socials)
  contact.addresses = addIfCurrentlyEmpty(contact.addresses, data.addresses)
  contact.imports.push(importId)
  contact.updatedBy = createdBy
  contact.updatedAt = new Date()

  const id = contact._id
  delete contact._id
  delete contact.createdBy
  delete contact.createdAt

  Contacts.update({
    _id: id
  }, {
    $set: contact
  })

  ContactsImport.update({
    _id: importId
  }, {
    $push: {
      'results.updated': id
    }
  })
}

function addIfCurrentlyEmpty (oldList = [], newList = []) {
  if (oldList.length > 0) {
    return oldList
  }

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
