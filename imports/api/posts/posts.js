import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import { CreatedAtSchema } from '/imports/lib/schema'
import toUserRef from '/imports/lib/to-user-ref'
import Contacts, { ContactRefSchema } from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/medialists/medialists'

const Posts = new Mongo.Collection('posts')

Posts.allow(nothing)

export default Posts

export const PostSchema = new SimpleSchema([
  CreatedAtSchema,
  {
    message: {
      type: String,
      optional: true
    },
    contacts: {
      type: [ContactRefSchema],
      minCount: 0
    },
    medialists: {
      type: [String],
      minCount: 0
    },
    status: {
      type: String,
      allowedValues: values(Contacts.status),
      optional: true
    },
    type: {
      type: String,
      allowedValues: [
        'feedback',
        'coverage',
        'need to know',
        'details changed',
        'medialists changed',
        'campaign created'
      ],
      optional: true
    },
    details: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }
])

Posts.createCampaignCreated = ({ user, campaign, author }) => {
  const post = {
    type: 'campaign created',
    medialists: [campaign.slug],
    contacts: [],
    message: `created a campaign`,
    details: {
      campaign: {
        _id: campaign._id,
        slug: campaign.slug,
        name: campaign.name,
        avatar: campaign.avatar,
        clientName: campaign.client && campaign.client.name,
        updatedAt: campaign.updatedAt
      }
    },
    createdBy: toUserRef(user),
    createdAt: new Date()
  }

  check(post, PostSchema)
  return Posts.insert(post)
}

Posts.createCampaignChange = ({action, campaignSlug, contactSlugs, updatedAt, updatedBy}) => {
  const contacts = Contacts.findContactRefs({contactSlugs})
  const medialists = Campaigns.findCampaignRefs({campaignSlugs: [campaignSlug]})
  const post = {
    type: 'medialists changed',
    message: `${action} ${contacts.length} ${(action === 'added') ? 'to' : 'from'} ${medialists[0].name}`,
    contacts,
    medialists,
    details: {
      action: action
    },
    createdBy: updatedBy,
    createdAt: updatedAt
  }
  check(post, PostSchema)
  return Posts.insert(post)
}

Posts.feedLimit = {
  initial: 20,
  increment: 5
}
