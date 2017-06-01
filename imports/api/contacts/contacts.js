import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { TagRefSchema } from '/imports/api/tags/tags'
import { LabelValueSchema, AuditSchema } from '/imports/lib/schema'
import StatusMap from '/imports/api/contacts/status'

const Contacts = new Mongo.Collection('contacts')

Contacts.allow(nothing)

Contacts.allContactsCount = () => Counter.get('contactCount')

export default Contacts

Contacts.toRef = ({_id, slug, name, avatar, outlets}) => ({
  _id,
  slug,
  name,
  avatar,
  outletName: outlets && outlets.length ? outlets[0].label : ''
})

Contacts.findRefs = ({contactSlugs}) => {
  return Contacts.find(
    { slug: { $in: contactSlugs } },
    { fields: { _id: 1, slug: 1, name: 1, avatar: 1, outlets: 1 } }
  ).map(Contacts.toRef)
}

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
  bio: {
    type: String,
    optional: true
  },
  // TODO: Refactor the socials schema to allow for twitterId or other properties
  socials: {
    type: [Object]
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
  addresses: {
    type: [Object]
  },
  'addresses.$.street': {
    type: String,
    optional: true
  },
  'addresses.$.city': {
    type: String,
    optional: true
  },
  'addresses.$.postcode': {
    type: String,
    optional: true
  },
  'addresses.$.country': {
    type: String,
    optional: true
  }
})

export const ContactSchema = new SimpleSchema([
  AuditSchema,
  ContactCreateSchema,
  {
    slug: {
      type: String,
      min: 1
    },
    // References to other collections
    campaigns: {
      type: [String]
    },
    masterLists: {
      type: [MasterListRefSchema]
    },
    tags: {
      type: [TagRefSchema]
    }
  }
])

// TODO: needs contact object for context
// Contacts.fieldNames = function (name) {
//   var key = name.split('.')[0]
//   return {
//     name: 'name',
//     outlets: 'outlet',
//     socials: 'social',
//     emails: 'email',
//     phones: 'phone number',
//     website: 'website',
//     address: 'address'
//   }[key]
// }
