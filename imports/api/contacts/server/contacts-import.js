import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { check, Match } from 'meteor/check'
import slugify from '/imports/lib/slug'
import { findOneUserRef } from '/imports/api/users/users'
import ContactsTask from '/imports/api/twitter-users/server/contacts-task'
import Contacts, { ContactSchema } from '../contacts'

// TODO: reafactor to return _ids of created and updated users, so we can do batch actions on them. Or use the tag?

export const importContacts = new ValidatedMethod({
  name: 'importContacts',

  validate ({contacts}) {
    check(contacts, [{
      emails: Match.Optional([{label: String, value: String}]),
      socials: Match.Optional([{label: String, value: String}]),
      phones: Match.Optional([{label: String, value: String}]),
      name: Match.Optional(String),
      address: Match.Optional(String),
      outlets: Match.Optional([{label: String, value: String}]),
      sectors: Match.Optional(String),
      languages: Match.Optional(String)
    }])
  },

  run ({ contacts }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    var userRef = findOneUserRef(this.userId)

    console.log(`Importing ${contacts.length} contacts`)

    var results = {created: 0, updated: 0}

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

    return results
  }
})

function createContact (data, userRef) {
  console.log(`Creating contact ${data.name}`)

  data.name = data.name || 'Unknown'
  data.emails = data.emails || []
  data.socials = data.socials || []
  data.phones = data.phones || []

  data.slug = slugify(data.name, Contacts)
  data.medialists = []
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
  console.log(`Merging contact ${data.name}`)

  ;['emails', 'socials', 'phones'].forEach(key => {
    contact[key] = mergeLabelValueLists(contact[key], data[key])
  })

  ;[
    'name',
    'address',
    'outlets',
    'sectors',
    'languages'
  ].forEach(key => {
    if (!contact[key] && data[key]) {
      contact[key] = data[key]
    }
  })

  contact.createdAt = moment(contact.createdAt).toDate()

  contact.updatedAt = new Date()
  contact.updatedBy = userRef

  var id = contact._id
  delete contact._id

  check(contact, ContactSchema)

  Contacts.update({_id: id}, {$set: contact})
  ContactsTask.queueUpdate(id)
}

function mergeLabelValueLists (oldList, newList) {
  oldList = oldList || []
  newList = newList || []

  var newItems = newList.reduce((list, newItem) => {
    var newValue = newItem.value.toLowerCase()
    var exists = oldList.some(oldItem => oldItem.value.toLowerCase() === newValue)
    return exists ? list : list.concat(newItem)
  }, [])

  return oldList.concat(newItems)
}
