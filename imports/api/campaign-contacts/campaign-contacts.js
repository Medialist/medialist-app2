import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { StatusValues } from '/imports/api/contacts/status'
import Contacts from '/imports/api/contacts/contacts'

const CampaignContacts = new Mongo.Collection('campaign_contacts')
CampaignContacts.allow(nothing)

if (Meteor.isServer) {
  CampaignContacts._ensureIndex({ slug: 1 })
  CampaignContacts._ensureIndex({ campaign: 1 })
}

export default CampaignContacts

CampaignContacts.toRef = (contact) => {
  if (!contact) {
    return null
  }

  const ref = Contacts.toRef(contact)
  ref.status = contact.status || StatusValues.toContact

  if (!ref.avatar) {
    delete ref.avatar
  }

  return ref
}

CampaignContacts.findRefs = ({ contactSlugs }) => {
  return CampaignContacts.find({
    slug: {
      $in: contactSlugs
    }
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      status: 1,
      campaign: 1,
      updatedAt: 1,
      updatedBy: 1
    }
  }).map(CampaignContacts.toRef)
}

CampaignContacts.findOneRef = (slugOrId) => {
  return CampaignContacts.toRef(CampaignContacts.findOne({
    $or: [{
      _id: slugOrId
    }, {
      slug: slugOrId
    }]
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      status: 1,
      campaign: 1,
      updatedAt: 1,
      updatedBy: 1
    }
  }))
}
