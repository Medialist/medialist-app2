import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Campaigns from '/imports/api/campaigns/campaigns'
import Tags from '/imports/api/tags/tags'

/**
 * SearchEnricherHOC
 *
 * I fetch additional info about the search params from `search-url-query-container`
 * and add them to the props of the wrapped Component.
 *
  * You can optionally pass in any of:
  * - `campaignSlugs` - Array of campaigns to search in.
  * - `tagSlugs` - To search a in a specific list
  *
  * Your component will recieve these additional props:
  * - `selectedTags` - Tags for the tagSlugs
  * - `campaigns` - Campaigns for the campaignSlugs
  * - `loading` - true if any subs are not ready
 */
export default (Component) => createContainer((props) => {
  const {
    campaignSlugs,
    tagSlugs
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

  const loading = props.loading || subs.some((s) => !s.ready())

  return {...data, loading}
}, Component)
