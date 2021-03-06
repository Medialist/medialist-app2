import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import everything from '/imports/lib/everything'

const Campaigns = new Mongo.Collection('campaigns')
Campaigns.deny(everything)

if (Meteor.isServer) {
  Campaigns._ensureIndex({ slug: 1 })
  Campaigns._ensureIndex({ 'contacts.slug': 1 })
}

export default Campaigns

Campaigns.allCampaignsCount = () => Counter.get('campaignCount')

Campaigns.toRef = (campaign) => {
  if (!campaign) {
    return null
  }

  const {
    _id,
    slug,
    name,
    avatar,
    client,
    updatedAt,
    createdAt
  } = campaign

  const ref = {
    _id,
    slug,
    name,
    avatar,
    clientName: client ? client.name : '',
    updatedAt: updatedAt || createdAt
  }

  if (!ref.avatar) {
    delete ref.avatar
  }

  if (!ref.clientName) {
    delete ref.clientName
  }

  return ref
}

Campaigns.findRefs = ({campaignSlugs}) => {
  return Campaigns.find({
    slug: {
      $in: campaignSlugs
    }
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      client: 1,
      updatedAt: 1,
      createdAt: 1
    }
  }).map(Campaigns.toRef)
}

Campaigns.findOneRef = (campaignSlugOrId) => {
  return Campaigns.toRef(Campaigns.findOne({
    $or: [{
      _id: campaignSlugOrId
    }, {
      slug: campaignSlugOrId
    }]
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      client: 1,
      updatedAt: 1,
      createdAt: 1
    }
  }))
}

Campaigns.replaceContact = (incoming, outgoing) => {
  // Remove outgoing where both are on the same campaign
  Campaigns.update({
    $and: [
      {'contacts.slug': incoming.slug},
      {'contacts.slug': outgoing.slug}
    ]
  }, {
    $pull: {
      'contacts': {
        slug: outgoing.slug
      }
    }
  }, {
    multi: true
  })

  // replace the old contact slug on all campaigns that reference it.
  Campaigns.update({
    'contacts.slug': outgoing.slug
  }, {
    $set: {
      'contacts.$.slug': incoming.slug
    }
  }, {
    multi: true
  })

  // return the new list of campaign slugs that the incoming contact is on
  return Campaigns.find({
    'contacts.slug': incoming.slug
  }, {
    fields: {
      slug: 1
    }
  }).map(c => c.slug)
}
