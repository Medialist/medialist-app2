import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import { AuditSchema } from '/imports/lib/schema'
import { EmbedRefSchema } from '/imports/api/embeds/embeds'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import { ContactRefSchema } from '/imports/api/contacts/schema'
import { CampaignRefSchema } from '/imports/api/campaigns/schema'

const Posts = new Mongo.Collection('posts')
Posts.types = [
  'FeedbackPost',
  'CoveragePost',
  'NeedToKnowPost',
  'CreateCampaign',
  'AddContactsToCampaign',
  'StatusUpdate'
]

export const PostSchema = new SimpleSchema([
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
      allowedValues: Posts.types
    }
  }
])

Posts.attachSchema(PostSchema)
Posts.allow(nothing)

Posts.feedLimit = {
  initial: 20,
  increment: 5
}

Posts.create = ({type, contactSlugs = [], campaignSlugs = [], message, status, embeds = [], createdBy}) => {
  const contacts = Contacts.findRefs({contactSlugs})
  const campaigns = Campaigns.findRefs({campaignSlugs})
  const post = {
    type,
    contacts,
    campaigns,
    message,
    status,
    embeds,
    createdBy
  }

  return Posts.insert(post)
}

export default Posts
