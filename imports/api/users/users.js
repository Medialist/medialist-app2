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
  const contactRefs = Contacts.findRefs({ contactSlugs })
  const campaignRefs = Campaigns.findRefs({ campaignSlugs })

  if (!contactRefs.length && !campaignRefs.length) {
    return
  }

  const $addToSet = {}

  if (contactRefs.length) {
    $addToSet.myContacts = {
      $each: contactRefs
    }
  }

  if (campaignRefs.length) {
    $addToSet.myCampaigns = {
      $each: campaignRefs
    }
  }

  return Meteor.users.update({
    _id: userId
  }, {
    $addToSet
  })
}
