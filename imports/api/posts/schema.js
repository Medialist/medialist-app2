import SimpleSchema from 'simpl-schema'
import values from 'lodash.values'
import { IdSchema, AuditSchema, CreatedAtSchema } from '/imports/lib/schema'
import Contacts from '/imports/api/contacts/contacts'
import { CampaignRefSchema } from '/imports/api/campaigns/schema'
import { ContactRefSchema } from '/imports/api/contacts/schema'
import { EmbedRefSchema } from '/imports/api/embeds/schema'

export const PostTypes = [
  'FeedbackPost',
  'CoveragePost',
  'NeedToKnowPost',
  'CreateCampaign',
  'AddContactsToCampaign',
  'StatusUpdate'
]

export const PostSchema = new SimpleSchema({
  contacts: {
    type: Array,
    minCount: 0
  },
  'contacts.$': {
    type: ContactRefSchema
  },
  campaigns: {
    type: Array,
    minCount: 0
  },
  'campaigns.$': {
    type: CampaignRefSchema
  },
  embeds: {
    type: Array,
    minCount: 0
  },
  'embeds.$': {
    type: EmbedRefSchema
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
})
PostSchema.extend(IdSchema)
PostSchema.extend(AuditSchema)
PostSchema.extend(CreatedAtSchema)

export const UpdatePostSchema = new SimpleSchema({
  message: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    allowedValues: values(Contacts.status),
    optional: true
  },
  contact: {
    type: ContactRefSchema,
    optional: true
  },
  campaign: {
    type: CampaignRefSchema,
    optional: true
  }
})
UpdatePostSchema.extend(IdSchema)
