import { Meteor } from 'meteor/meteor'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import toUserRef from '/imports/lib/to-user-ref'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'

export const UserRefSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    optional: true
  }
})

export const findOneUserRef = (userId) => {
  const user = Meteor.users.findOne(
    { _id: userId },
    { fields: { _id: 1, 'profile.name': 1, 'services.twitter': 1 } }
  )
  return toUserRef(user)
}

export const findUserRefs = ({userIds}) => {
  Meteor.users.find(
    { _id: { $in: userIds } },
    { fields: { _id: 1, 'profile.name': 1, 'services.twitter': 1 } }
  ).map(toUserRef)
}

/*
 * Add all the contacts and campaigns to the user my<Type> Arrays
 */
export const addToMyFavourites = ({userId, contactSlugs = [], campaignSlugs = []}) => {
  const user = Meteor.users.findOne(
    { _id: userId },
    { fields: { myContacts: 1, myCampaigns: 1 } }
  )
  const now = new Date()
  const myContacts = findMyContactRefs({user, contactSlugs, now})
  const myCampaigns = findMyCampaignRefs({user, campaignSlugs, now})
  const $set = {}
  if (myContacts.length) $set.myContacts = myContacts
  if (myCampaigns.length) $set.myCampaigns = myCampaigns

  return Meteor.users.update(
    { _id: userId },
    { $set }
  )
}

function findMyContactRefs ({user, contactSlugs, now}) {
  if (contactSlugs.length === 0) return []

  const newRefs = Contacts.find(
    { slug: { $in: contactSlugs } },
    { fields: { avatar: 1, slug: 1, name: 1, outlets: 1 } }
  ).map((contact) => ({
    _id: contact._id,
    name: contact.name,
    slug: contact.slug,
    avatar: contact.avatar,
    outlets: contact.outlets,
    updatedAt: now
  }))

  // Preserve other favs.
  const existingRefs = user.myContacts.filter((c) => !contactSlugs.includes(c.slug))

  return newRefs.concat(existingRefs)
}

function findMyCampaignRefs ({user, campaignSlugs, now}) {
  if (campaignSlugs.length === 0) return []

  // transform campaigns into refs for user.myCampaigns array.
  const newRefs = Campaigns.find(
    { slug: { $in: campaignSlugs } },
    { fields: { avatar: 1, slug: 1, name: 1, client: 1 } }
  ).map((campaign) => ({
    _id: campaign._id,
    name: campaign.name,
    slug: campaign.slug,
    avatar: campaign.avatar,
    clientName: campaign.client && campaign.client.name || '',
    updatedAt: now
  }))

  // Preserve other favs.
  const existingRefs = user.myCampaigns.filter((c) => !campaignSlugs.includes(c.slug))

  return newRefs.concat(existingRefs)
}
