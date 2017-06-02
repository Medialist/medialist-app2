import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { TagRefSchema } from '/imports/api/tags/tags'
import { LabelValueSchema, AuditSchema } from '/imports/lib/schema'

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
    type: [LabelValueSchema],
    defaultValue: []
  },
  emails: {
    type: [LabelValueSchema],
    defaultValue: [],
    min: 1
  },
  phones: {
    type: [LabelValueSchema],
    defaultValue: []
  },
  bio: {
    type: String,
    optional: true
  },
  // TODO: Refactor the socials schema to allow for twitterId or other properties
  socials: {
    type: [Object],
    defaultValue: []
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
    type: [Object],
    defaultValue: []
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
      type: [String],
      defaultValue: []
    },
    masterLists: {
      type: [MasterListRefSchema],
      defaultValue: []
    },
    tags: {
      type: [TagRefSchema],
      defaultValue: []
    }
  }
])
