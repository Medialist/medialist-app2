import { Mongo } from 'meteor/mongo'
import dot from 'dot-object'
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

Posts.create = ({type, contactSlugs = [], campaignSlugs = [], message, status, embeds = [], createdBy, createdAt = new Date(), pinnedBy, pinnedAt}) => {
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
    createdAt,
    pinnedBy,
    pinnedAt
  }

  return Posts.insert(post)
}

export default Posts

Posts.replaceContact = (incoming, outgoing) => {
  // Remove outgoing where both are on the same post
  Posts.update({
    $and: [
      {'contacts._id': incoming._id},
      {'contacts._id': outgoing._id}
    ]
  }, {
    $pull: {
      'contacts': {
        _id: outgoing._id
      }
    }
  }, {
    multi: true
  })

  // Update incoming contactRefs with new merged info
  Posts.update({
    'contacts._id': incoming._id
  }, {
    $set: dot.dot({
      'contacts.$': Contacts.toRef(incoming)
    })
  }, {
    multi: true
  })

  // Overwrite ougoing contactRefs with incoming contacRef
  Posts.update({
    'contacts._id': outgoing._id
  }, {
    $set: dot.dot({
      'contacts.$': Contacts.toRef(incoming)
    })
  }, {
    multi: true
  })
}
