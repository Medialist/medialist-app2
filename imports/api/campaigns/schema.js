import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { TagRefSchema } from '/imports/api/tags/tags'
import { AuditSchema, UserRefSchema, LinkSchema } from '/imports/lib/schema'

export const CampaignRefSchema = new SimpleSchema([{
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
  clientName: {
    type: String,
    optional: true
  },
  updatedAt: {
    type: Date
  }
}])

export const CampaignSchema = new SimpleSchema([
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
      regEx: SimpleSchema.RegEx.Id,
      optional: true
    },
    'client.name': {
      type: String,
      min: 1,
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
