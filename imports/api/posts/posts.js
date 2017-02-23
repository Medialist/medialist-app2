import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
// import { check } from 'meteor/check'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import { CreatedAtSchema } from '/imports/lib/schema'
import Contacts, { ContactRefSchema } from '/imports/api/contacts/contacts'
import Campaigns, { CampaignRefSchema } from '/imports/api/campaigns/campaigns'

const Posts = new Mongo.Collection('posts')

Posts.allow(nothing)

export default Posts

Posts.types = [
  'FeedbackPost',
  'CoveragePost',
  'NeedToKnowPost',
  'CampaignCreated',
  'CampaignChanged'
]

Posts.feedLimit = {
  initial: 20,
  increment: 5
}

export const PostSchema = new SimpleSchema([
  CreatedAtSchema,
  {
    contacts: {
      type: [ContactRefSchema],
      minCount: 0
    },
    campaigns: {
      type: [CampaignRefSchema],
      minCount: 0
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

Posts.create = ({type, contactSlugs = [], campaignSlugs = [], createdBy, createdAt}) => {
  const contacts = Contacts.findRefs({contactSlugs})
  const campaigns = Campaigns.findRefs({campaignSlugs})
  const post = {
    type,
    contacts,
    campaigns,
    createdBy,
    createdAt
  }
  return Posts.insert(post)
}
