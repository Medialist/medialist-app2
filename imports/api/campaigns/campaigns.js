import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import nothing from '/imports/lib/nothing'
import { CampaignSchema } from '/imports/api/campaigns/schema'

const Campaigns = new Mongo.Collection('campaigns')
Campaigns.attachSchema(CampaignSchema)
Campaigns.allow(nothing)

if (Meteor.isServer) {
  Campaigns._ensureIndex({ slug: 1 })
}

export default Campaigns

Campaigns.allCampaignsCount = () => Counter.get('campaignCount')

Campaigns.toRef = ({_id, slug, name, avatar, client, updatedAt, createdAt}) => {
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
