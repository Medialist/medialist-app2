import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import { PostSchema, PostTypes } from '/imports/api/posts/schema'

const Posts = new Mongo.Collection('posts')

Posts.types = PostTypes

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
