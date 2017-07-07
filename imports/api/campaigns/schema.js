import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/schema'
import { TagRefSchema } from '/imports/api/tags/schema'
import { IdSchema, AuditSchema, UserRefSchema, LinkSchema } from '/imports/lib/schema'

export const CampaignRefSchema = new SimpleSchema([
  IdSchema, {
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
    clientName: {
      type: String,
      optional: true
    },
    updatedAt: {
      type: Date
    }
  }
])

export const CampaignSchema = new SimpleSchema([
  IdSchema,
  AuditSchema, {
    name: {
      type: String,
      min: 1
    },
    avatar: {
      type: String,
      optional: true
    },
    purpose: {
      type: String,
      min: 1,
      optional: true
    },
    slug: {
      type: String,
      denyUpdate: true
    },
    contacts: {
      type: Object,
      blackbox: true,
      defaultValue: {}
    },
    'client._id': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    'client.name': {
      type: String,
      optional: true
    },
    masterLists: {
      type: [MasterListRefSchema],
      defaultValue: []
    },
    tags: {
      type: [TagRefSchema],
      defaultValue: []
    },
    team: {
      type: [UserRefSchema],
      defaultValue: []
    },
    links: {
      type: [LinkSchema],
      defaultValue: []
    }
  }
])

export const updateCampaignSchema = new SimpleSchema([
  IdSchema,
  {
    slug: {
      type: String,
      denyUpdate: true
    },
    name: {
      type: String,
      min: 1
    },
    avatar: {
      type: String,
      optional: true
    },
    clientName: {
      type: String,
      optional: true
    },
    updatedAt: {
      type: Date
    }
  }
])
