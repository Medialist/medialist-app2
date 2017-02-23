import Campaigns, { MedialistSchema } from '/imports/api/campaigns/campaigns'

// <Legacy compat>
if (Meteor.isServer) {
  global.Campaigns = Campaigns
} else {
  window.Campaigns = Campaigns
}

Schemas.Campaigns = MedialistSchema
// </Legacy compat>
