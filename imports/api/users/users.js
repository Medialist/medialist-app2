import { Meteor } from 'meteor/meteor'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/medialists/medialists'

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

/*
 * Add all the contacts and campaigns to the user my<Type> Arrays
 */
export const addToMyFavourites = ({userId, contactSlugs = [], campaignSlugs = []}) => {
  const user = Meteor.users.findOne(
    { _id: userId },
    { fields: { myContacts: 1, myMedialists: 1 } }
  )
  const now = new Date()
  const myContacts = findMyContactRefs({user, contactSlugs, now})
  const myMedialists = findMyCampaignRefs({user, campaignSlugs, now})
  const $set = {}
  if (myContacts.length) $set.myContacts = myContacts
  if (myMedialists.length) $set.myMedialists = myMedialists

  return Meteor.users.update(
    { _id: userId },
    { $set }
  )
}

function findMyContactRefs ({user, contactSlugs, now}) {
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
  // transform campaigns into refs for user.myMedialists array.
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
