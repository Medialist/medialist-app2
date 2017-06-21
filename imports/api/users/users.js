import { Meteor } from 'meteor/meteor'
import toUserRef from '/imports/lib/to-user-ref'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'

export const findOneUserRef = (userId) => {
  const user = Meteor.users.findOne({
    _id: userId
  }, {
    fields: {
      _id: 1,
      'profile.name': 1,
      'profile.avatar': 1,
      'emails': 1
    }
  })

  return toUserRef(user)
}

export const findUserRefs = (userIds) => {
  return Meteor.users.find({
    _id: {
      $in: userIds
    }
  }, {
    fields: {
      _id: 1,
      'profile.name': 1,
      'profile.avatar': 1,
      'emails': 1
    }
  }).map(toUserRef)
}

/*
 * Add contacts or campaigns (or both) to the users my<Type> Arrays.
 */
export const addToMyFavourites = ({userId, contactSlugs = [], campaignSlugs = []}) => {
  const user = Meteor.users.findOne({
    _id: userId
  }, {
    fields: {
      myContacts: 1,
      myCampaigns: 1
    }
  })
  const myContacts = findMyContactRefs({user, contactSlugs})
  const myCampaigns = findMyCampaignRefs({user, campaignSlugs})
  const $set = {}

  if (myContacts.length) {
    $set.myContacts = myContacts
  }

  if (myCampaigns.length) {
    $set.myCampaigns = myCampaigns
  }

  return Meteor.users.update({
    _id: userId
  }, {
    $set
  })
}

// Used to update the users myContacts array.
// Returns a new `myContacts` array by creating new ContactRef-like objects
// for the `contactSlugs` and merging them with the users existing ones.
function findMyContactRefs ({user, contactSlugs, updatedAt}) {
  if (contactSlugs.length === 0) {
    return []
  }

  const newRefs = Contacts.findRefs({ contactSlugs })

  // Preserve other favs.
  const existingRefs = user.myContacts.filter((c) => !contactSlugs.includes(c.slug))

  return newRefs.concat(existingRefs)
}

// Used to update the users `myCampaigns` array.
// Returns a new `myCampaigns` array by creating new ContactRef-like objects
// for the `campaignSlugs` and merging them with the users existing ones.
function findMyCampaignRefs ({user, campaignSlugs, updatedAt}) {
  if (campaignSlugs.length === 0) {
    return []
  }

  // transform campaigns into refs for user.myCampaigns array.
  const newRefs = Campaigns.findRefs({ campaignSlugs })

  // Preserve other favs.
  const existingRefs = user.myCampaigns.filter((c) => !campaignSlugs.includes(c.slug))

  return newRefs.concat(existingRefs)
}
