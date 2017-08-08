import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Campaigns from '/imports/api/campaigns/campaigns'
import Tags from '/imports/api/tags/tags'

export default (Component) => createContainer((props) => {
  const {
    campaignSlugs,
    tagSlugs,
    userId
  } = props
  const subs = []
  const data = {}

  if (campaignSlugs) {
    subs.push(Meteor.subscribe('campaign-refs-by-slug', {campaignSlugs}))
    data.campaigns = Campaigns.find({
      slug: {
        $in: campaignSlugs
      }
    }).fetch()
  }

  if (tagSlugs && tagSlugs.length) {
    subs.push(Meteor.subscribe('tags-by-slug', {tagSlugs}))
    data.selectedTags = Tags.find({slug: { $in: tagSlugs }}).fetch()
  }

  if (userId && userId !== Meteor.userId()) {
    subs.push(Meteor.subscribe('users-by-id', {userIds: [userId]}))
  }

  const loading = props.loading || subs.some((s) => !s.ready())

  return {...data, loading}
}, Component)
