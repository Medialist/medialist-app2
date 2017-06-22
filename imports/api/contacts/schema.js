import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { TagRefSchema } from '/imports/api/tags/tags'
import { LabelValueSchema, AuditSchema } from '/imports/lib/schema'
import { check } from 'meteor/check'

export const ContactRefSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
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
  },
  outlets: {
    type: [LabelValueSchema],
    defaultValue: null
  },
  updatedAt: {
    type: Date
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
    defaultValue: []
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

export const ContactCampaignSchema = new SimpleSchema({
  updatedAt: {
    type: Date
  }
})

export const ContactSchema = new SimpleSchema([
  AuditSchema,
  ContactCreateSchema, {
    slug: {
      type: String,
      min: 1
    },
    // References to other collections
    campaigns: {
      type: Object,
      defaultValue: {},
      blackbox: true,
      custom: function () {
        // ugh https://github.com/aldeed/meteor-simple-schema/issues/244
        Object.keys(this.value).forEach(key => {
          check(this.value[key], ContactCampaignSchema)
        })
      }
    },
    masterLists: {
      type: [MasterListRefSchema],
      defaultValue: []
    },
    tags: {
      type: [TagRefSchema],
      defaultValue: []
    },
    imports: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
      defaultValue: []
    }
  }
])
