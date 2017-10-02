import { Mongo } from 'meteor/mongo'
import everything from '/imports/lib/everything'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import { PostTypes } from '/imports/api/posts/schema'

const Posts = new Mongo.Collection('posts')
Posts.types = PostTypes
Posts.deny(everything)

Posts.feedLimit = {
  initial: 20,
  increment: 5
}

Posts.create = ({type, contactSlugs = [], campaignSlugs = [], message, status, embeds = [], createdBy, createdAt = new Date()}) => {
  const contacts = Contacts.findRefs({contactSlugs})
  contacts.forEach(contact => {
    contact.updatedAt = createdAt
  })

  const campaigns = Campaigns.findRefs({campaignSlugs})
  campaigns.forEach(campaign => {
    campaign.updatedAt = createdAt
  })

  const post = {
    type,
    contacts,
    campaigns,
    message,
    status,
    embeds,
    createdBy,
    createdAt
  }

  return Posts.insert(post)
}

export default Posts
