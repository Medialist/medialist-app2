import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'

export default {
  name: 'Add latestPost and coverage to campaign contact',
  up: () => {
    Campaigns.forEach((campaign) => {
      campaign.contacts.forEach(contact => {
        // contacts.$.latestPost
        const latestPost = Posts.findOne({
          campaigns: campaign.slug,
          'contacts.slug': contact.slug,
          type: {
            $in: [
              'FeedbackPost',
              'CoveragePost',
              'StatusUpdate'
            ]
          }
        }, {
          sort: {
            createdAt: -1
          }
        })
        // contacts.$.coverage
        const coverage = Posts.find({
          campaigns: campaign.slug,
          'contacts.slug': contact.slug,
          type: 'CoveragePost'
        }, {
          sort: { createdAt: -1 }
        }).fetch()

        Campaigns.update({
          _id: campaign._id,
          'contacts.slug': contact.slug
        }, {
          $set: {
            'contacts.$.latestPost': latestPost,
            'contacts.$.coverage': coverage
          }
        })
      })
    })
  }
}
