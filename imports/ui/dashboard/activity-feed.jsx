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
    campaign: PropTypes.object,
    contact: PropTypes.object
  },

  getInitialState () {
    return {
      filterType: filterNames[0],
      filterCampaign: null
    }
  },

  onFilterChange (filterType) {
    this.setState({ filterType })
  },

  onCampaignFilterChange (filterCampaign) {
    this.setState({ filterCampaign })
  },

  render () {
    const { onFilterChange, onCampaignFilterChange } = this
    const { contact, campaign } = this.props
    const { filterType, filterCampaign } = this.state
    return (
      <div>
        <div className='flex justify-start items-center'>
          <ActivityFilter selected={filterType} onChange={onFilterChange} />
          {!campaign &&
            <div>
              <span className='gray80'>|</span>
              <CampaignFilterContainer contact={contact} onCampaignFilter={onCampaignFilterChange} />
            </div>
          }
          <hr className='flex-auto pl2' style={{height: 1}} />
        </div>
        <ActivityListContainer filter={filterType} campaign={filterCampaign || campaign} contact={contact} />
      </div>
    )
  }
})

const CampaignFilterContainer = createContainer((props) => {
  const sub = Meteor.subscribe('campaigns')
  const query = {}
  if (props.contact) query.slug = {$in: props.contact.campaigns}
  const campaigns = Campaigns.find(query).fetch()
  return {
    loading: !sub.ready(),
    campaigns,
    ...props
  }
}, CampaignFilter)

const ActivityListContainer = createContainer((props) => {
  const limit = props.limit || 20
  const typesForFilter = {
    'All Activity': Posts.types,
    'Feedback': ['FeedbackPost'],
    'Coverage': ['CoveragePost'],
    'Need-to-knows': ['NeedToKnowPost'],
    'Updates': ['StatusUpdate']
  }
  const types = typesForFilter[props.filter] || Posts.types
  const subs = [
    Meteor.subscribe('campaign-favourites'),
    Meteor.subscribe('posts', { limit, types })
  ]
  const query = {
    type: { $in: types }
  }
  if (props.campaign) query['campaigns.slug'] = props.campaign.slug
  if (props.contact) query['contacts.slug'] = props.contact.slug
  const items = Posts.find(query, { sort: { createdAt: -1 }, limit }).fetch()
  const loading = subs.some((s) => !s.ready())
  return {
    loading,
    currentUser: Meteor.user(),
    hideContact: !!props.contact,
    hideCampaign: !!props.campaign,
    items,
    ...props
  }
}, ActivityList)

export default ActivityFeed
