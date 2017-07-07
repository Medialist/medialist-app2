import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import values from 'lodash.values'
import { IdSchema, AuditSchema } from '/imports/lib/schema'
import Contacts from '/imports/api/contacts/contacts'
import { CampaignRefSchema, updateCampaignSchema } from '/imports/api/campaigns/schema'
import { ContactRefSchema, updateContactSchema } from '/imports/api/contacts/schema'
import { EmbedRefSchema } from '/imports/api/embeds/schema'
import { StatusValues } from '/imports/api/contacts/status'

export const PostTypes = [
  'FeedbackPost',
  'CoveragePost',
  'NeedToKnowPost',
  'CreateCampaign',
  'AddContactsToCampaign',
  'StatusUpdate'
]

export const PostSchema = new SimpleSchema([
  IdSchema,
  AuditSchema, {
    contacts: {
      type: [ContactRefSchema],
      minCount: 0,
      defaultValue: []
    },
    campaigns: {
      type: [CampaignRefSchema],
      minCount: 0,
      defaultValue: []
    },
    embeds: {
      type: [EmbedRefSchema],
      minCount: 0,
      defaultValue: []
    },
    message: {
      type: String,
      optional: true
    },
    status: {
      type: String,
      allowedValues: values(Contacts.status),
      optional: true
    },
    type: {
      type: String,
      allowedValues: values(PostTypes)
    }
  }
])

export const updatePostSchema = new SimpleSchema([
  IdSchema,
  {
    message: {
      type: String,
      optional: true
    },
    status: {
      type: String,
      allowedValues: StatusValues,
      optional: true
    },
    contact: {
      type: updateContactSchema,
      optional: true
    },
    campaign: {
      type: updateCampaignSchema,
      optional: true
    }
  }
])
