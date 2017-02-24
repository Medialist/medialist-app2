import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ActivityList from './activity-list'
import ActivityFilter from './activity-filter'
import CampaignFilter from './campaign-filter'
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
    return { filterName: 'Top Activity' }
  },

  onFilterChange (filterName) {
    this.setState({ filterName })
  },

  render () {
    const { loading, items, campaign, campaigns, contact } = this.props
    const { filterName } = this.state
    return (
      <div>
        <div className='flex items-center'>
          <ActivityFilter selected={filterName} onChange={this.onFilterChange} />
          <span>|</span>
          <CampaignFilter loading={loading} contact={contact} campaigns={campaigns} />
          <hr className='flex-auto pl2' style={{height: 1}} />
        </div>
        <ActivityList items={items} filter={filterName} campaign={campaign} contact={contact} />
      </div>
    )
  }
})

const ActivityFeedContainer = createContainer((props) => {
  const limit = props.limit || 10
  const typesForFilter = {
    'Top Activity': Posts.types,
    'Coverage': ['CoveragePost'],
    'Need To Know': ['NeedToKnowPost']
  }
  const types = typesForFilter[props.filter]
  const campaignSlugs = props.contact && props.contact.campaigns || []
  const subs = [
    Meteor.subscribe('campaign-favourites'),
    Meteor.subscribe('posts', { limit, types }),
    Meteor.subscribe('campaigns-by-slug', campaignSlugs)
  ]
  const loading = subs.some((s) => !s.ready())
  const query = {}
  if (props.campaign) query.campaigns = props.campaign.slug
  if (props.contact) query['contacts.slug'] = props.contact.slug
  const items = Posts.find(query, { sort: { createdAt: -1 }, limit }).fetch()
  const campaigns = Campaigns.find().fetch()
  return {
    currentUser: Meteor.user(),
    hideContact: !!props.contact,
    hideCampaign: !!props.campaign,
    loading,
    campaigns,
    items,
    ...props
  }
}, ActivityFeed)

export default ActivityFeedContainer
