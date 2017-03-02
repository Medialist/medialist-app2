import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { TagRefSchema } from '/imports/api/tags/tags'
import { LabelValueSchema, AuditSchema } from '/imports/lib/schema'
import StatusMap from './status'

const Contacts = new Mongo.Collection('contacts')

Contacts.allow(nothing)

Contacts.allContactsCount = () => Counter.get('contactCount')

export default Contacts

Contacts.search = ({
  term,
  masterListSlug,
  userId,
  campaignSlugs,
  sort,
  limit = 20,
  minSearchLength = 3
}) => {
  const query = {}

  if (campaignSlugs && campaignSlugs.length) {
    query.campaigns = { $in: campaignSlugs }
  }

  if (masterListSlug) {
    query['masterLists.slug'] = masterListSlug
  }

  if (userId) {
    const user = Meteor.users.findOne({_id: userId})
    const myContacts = user ? user.myContacts : []
    query.slug = { $in: myContacts.map((c) => c.slug) }
  }

  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(term, 'gi')
    query.$or = [
      { name: termRegExp },
      { 'outlets.value': termRegExp },
      { 'outlets.label': termRegExp }
    ]
  }
  return Contacts.find(query, {sort, limit})
}

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
  // TODO: Refactor address format
  address: {
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
      type: [String],
      regEx: SimpleSchema.RegEx.Id
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
