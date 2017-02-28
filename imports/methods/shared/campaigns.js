import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import '/imports/api/campaigns/methods'
import Campaigns from '/imports/api/campaigns/campaigns'

Meteor.methods({
  'campaigns/toggle-favourite': function (campaignSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can (un)favourite a campaign')
    const user = Meteor.users.findOne(this.userId, { fields: { myCampaigns: 1 } })
    check(campaignSlug, String)
    const campaign = Campaigns.findOne({ slug: campaignSlug }, { fields: { image: 1, slug: 1, name: 1, client: 1 } })
    if (!campaign) throw new Meteor.Error('Cannot find campaign')

    if (user.myCampaigns.some((m) => m._id === campaign._id)) {
      return Meteor.users.update(this.userId, { $pull: { myCampaigns: { _id: campaign._id } } })
    }
    return Meteor.users.update(this.userId, { $push: { myCampaigns: {
      _id: campaign._id,
      name: campaign.name,
      slug: campaign.slug,
      avatar: campaign.avatar,
      clientName: campaign.client && campaign.client.name,
      updatedAt: new Date()
    } } })
  }
})
