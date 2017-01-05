import { Mongo } from 'meteor/mongo'
import nothing from '/imports/api/nothing'
import { MasterListRefSchema } from '/imports/api/master-lists'

Contacts = new Mongo.Collection('contacts')

Contacts.allow(nothing)

Contacts.status = {
  completed: 'Completed',
  hotLead: 'Hot Lead',
  contacted: 'Contacted',
  toContact: 'To Contact',
  notInterested: 'Not Interested'
}
Contacts.phoneTypes = [
  'Mobile',
  'Landline'
]
Contacts.emailTypes = [
  'Work',
  'Personal',
  'Other'
]
Contacts.socialTypes = [
  'Twitter',
  'LinkedIn',
  'Facebook',
  'YouTube',
  'Pinterest',
  'Instagram'
]
// Get the index of a given status for sorting
// String => Integer
Contacts.statusIndex = [].indexOf.bind(_.values(Contacts.status))

Schemas.Contacts = new SimpleSchema({
  'createdBy._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'createdBy.name': {
    type: String
  },
  'createdBy.avatar': {
    type: String
  },
  createdAt: {
    type: Date
  },
  'updatedBy._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'updatedBy.name': {
    type: String
  },
  'updatedBy.avatar': {
    type: String
  },
  updatedAt: {
    type: Date
  },
  medialists: {
    type: [String]
  },
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    optional: true
  },
  socials: {
    type: [Object],
    optional: true
  },
  'socials.$.label': {
    type: String
  },
  'socials.$.value': {
    type: String,
    optional: true
  },
  'socials.$.twitterId': {
    type: String,
    optional: true
  },
  outlets: {
    type: [Object],
    optional: true
  },
  'outlets.$.label': { // this is the organisation (e.g. 'The Guardian')
    type: String
  },
  'outlets.$.value': { // this is the role (e.g. 'Technology writer')
    type: String
  },
  // TODO: import sectors as MasterLists...
  sectors: {
    type: String,
    optional: true
  },
  languages: {
    type: String,
    optional: true
  },
  address: {
    type: String,
    optional: true
  },
  website: {
    type: String,
    optional: true
  },
  emails: {
    type: [Object],
    optional: true
  },
  'emails.$.label': {
    type: String
  },
  'emails.$.value': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phones: {
    type: [Object],
    optional: true
  },
  'phones.$.label': {
    type: String
  },
  'phones.$.value': {
    type: String,
    optional: true
  },
  bio: {
    type: String,
    optional: true
  },
  slug: {
    type: String
  },
  importedData: {
    type: [Object],
    optional: true
  },
  'importedData.$.importedAt': {
    type: Date
  },
  'importedData.$.data': {
    type: Object,
    blackbox: true
  },
  masterLists: {
    type: [MasterListRefSchema]
  }
})

// TODO: needs contact object for context
Contacts.fieldNames = function (name) {
  var key = name.split('.')[0]
   return {
    'name': 'name',
    'outlets': 'outlet',
    'socials': 'social',
    'emails': 'email',
    'phones': 'phone number',
    'website': 'website',
    'address': 'address'
  }[key]
}
