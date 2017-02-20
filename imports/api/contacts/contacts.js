import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { TagRefSchema } from '/imports/api/tags/tags'
import { LabelValueSchema } from '/imports/lib/schema'
import StatusMap from './status'

const Contacts = new Mongo.Collection('contacts')

Contacts.allow(nothing)

export default Contacts

Contacts.status = StatusMap
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
Contacts.statusIndex = [].indexOf.bind(values(Contacts.status))

export const ContactRefSchema = new SimpleSchema({
  slug: {
    type: String
  },
  name: {
    type: String
  },
  avatar: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  }
})

export const ContactCreateSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  outlets: {
    type: [LabelValueSchema]
  },
  emails: {
    type: [LabelValueSchema]
  },
  phones: {
    type: [LabelValueSchema]
  },
  socials: {
    type: [LabelValueSchema]
  },
  // TODO: Refactor address format
  address: {
    type: String,
    optional: true
  }
})

export const ContactSchema = new SimpleSchema([
  ContactCreateSchema,
  {
    slug: {
      type: String,
      min: 1
    },
    // References to other collections
    medialists: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id
    },
    masterLists: {
      type: [MasterListRefSchema]
    },
    tags: {
      type: [TagRefSchema]
    },

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

    // TODO: import sectors as MasterLists...
    sectors: {
      type: String,
      optional: true
    },

    // TODO: No longer used.
    bio: {
      type: String,
      optional: true
    },
    languages: {
      type: String,
      optional: true
    },
    website: {
      type: String,
      optional: true
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
    }
  }
])

// TODO: needs contact object for context
Contacts.fieldNames = function (name) {
  var key = name.split('.')[0]
  return {
    name: 'name',
    outlets: 'outlet',
    socials: 'social',
    emails: 'email',
    phones: 'phone number',
    website: 'website',
    address: 'address'
  }[key]
}
