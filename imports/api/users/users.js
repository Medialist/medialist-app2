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
  const $pull = {}

  if (contactRefs.length) {
    $addToSet.myContacts = {
      $each: contactRefs
    }
    $pull.myContacts = {
      _id: {
        $in: contactRefs.map(c => c._id)
      }
    }
  }

  if (campaignRefs.length) {
    $addToSet.myCampaigns = {
      $each: campaignRefs
    }
    $pull.myCampaigns = {
      _id: {
        $in: campaignRefs.map(c => c._id)
      }
    }
  }

  Meteor.users.update({
    _id: userId
  }, {
    $pull
  })

  Meteor.users.update({
    _id: userId
  }, {
    $addToSet
  })
}

// Remove refs to outgoing where both incoming and outgoing are in the same myContats list.
// Update refs to outgoing to point to incoming where only outgoing in the myContacts list.
export const updateContact = (incoming, outgoing) => {
  Meteor.users.update({
    $and: [
      {'myContacts._id': incoming._id},
      {'myContacts._id': outgoing._id}
    ]
  }, {
    $pull: {
      'myContacts': {
        _id: outgoing._id
      }
    }
  }, {
    multi: true
  })

  Meteor.users.update({
    'myContacts._id': outgoing._id
  }, {
    $set: {
      'myContacts.$._id': incoming._id,
      'myContacts.$.name': incoming.name,
      'myContacts.$.slug': incoming.slug,
      'myContacts.$.avatar': incoming.avatar
    }
  }, {
    mutli: true
  })
}
