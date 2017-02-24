import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ActivityList from './activity-list'
import CampaignFilter from './campaign-filter'
import ActivityFilter, { filterNames } from './activity-filter'
import Posts from '/imports/api/posts/posts'
import Campaigns from '/imports/api/campaigns/campaigns'

const ActivityFeed = React.createClass({
  propTypes: {
    loading: PropTypes.bool,
    items: PropTypes.array,
    campaign: PropTypes.object,
    campaigns: PropTypes.array,
    contact: PropTypes.object
  },

  getInitialState () {
    return {
      filterName: filterNames[0],
      campaignName: null
    }
  },

  onFilterChange (filterName) {
    this.setState({ filterName })
  },

  onCampaignFilter (campaignName) {
    this.setState({ campaignName })
  },

  render () {
    const { loading, items, campaign, contact, campaigns } = this.props
    const { filterName, campaignName } = this.state
    let filteredItems = campaignName ? items.filter((item) => {
      return item.campaigns && item.campaigns.some((campaigns) => campaigns.name === campaignName)
    }) : items
    return (
      <div>
        <div className='flex items-center'>
          <ActivityFilter selected={filterName} onChange={this.onFilterChange} />
          <span className='gray80'>|</span>
          <CampaignFilter loading={loading} contact={contact} selected={campaignName} campaigns={campaigns} onCampaignFilter={this.onCampaignFilter} />
          <hr className='flex-auto pl2' style={{height: 1}} />
        </div>
        <ActivityList loading={loading} items={filteredItems} filter={filterName} campaign={campaign} contact={contact} />
      </div>
    )
  }
})

const ActivityFeedContainer = createContainer((props) => {
  const limit = props.limit || 20

  const typesForFilter = {
    'All Activity': Posts.types,
    'Feedback': ['FeedbackPost'],
    'Coverage': ['CoveragePost'],
    'Need-to-knows': ['NeedToKnowPost'],
    'Updates': ['StatusUpdate']
  }
  const types = typesForFilter[props.filter] || Posts.types
  const campaignSlugs = props.contact && props.contact.campaigns || []
  const subs = [
    Meteor.subscribe('campaign-favourites'),
    Meteor.subscribe('posts', { limit, types }),
    Meteor.subscribe('campaigns-by-slug', campaignSlugs)
  ]
  const query = {
    type: { $in: types }
  }
  if (props.campaign) query['campaigns.slug'] = props.campaign.slug
  if (props.contact) query['contacts.slug'] = props.contact.slug
  const campaigns = Campaigns.find().fetch()
  const items = Posts.find(query, { sort: { createdAt: -1 }, limit }).fetch()
  const loading = subs.some((s) => !s.ready())

  return {
    loading,
    currentUser: Meteor.user(),
    hideContact: !!props.contact,
    hideCampaign: !!props.campaign,
    campaigns,
    items,
    ...props
  }
}, ActivityFeed)

export default ActivityFeedContainer
