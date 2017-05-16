import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ActivityList from './activity-list'
import CampaignFilter from './campaign-filter'
import ActivityFilter, { filterNames } from './activity-filter'
import Posts from '/imports/api/posts/posts'
import Campaigns from '/imports/api/campaigns/campaigns'
import NearBottomContainer from '../navigation/near-bottom-container'
import SubscriptionLimitContainer from '../navigation/subscription-limit-container'

const ActivityFeed = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contact: PropTypes.object,
    'data-id': PropTypes.string
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
      <div data-id={this.props['data-id']}>
        <div className='flex justify-start items-center pb3'>
          <ActivityFilter selected={filterType} onChange={onFilterChange} />
          {!campaign &&
            <div>
              <span className='gray80'>|</span>
              <CampaignFilterContainer
                disabled={filterType === filterNames[3]}
                contact={contact}
                onCampaignFilter={onCampaignFilterChange}
              />
            </div>
          }
          <hr className='flex-auto pl2' style={{height: 1}} />
        </div>
        <NearBottomContainer>
          {(nearBottom) => (
            <SubscriptionLimitContainer wantMore={nearBottom}>
              {(limit) => (
                <ActivityListContainer limit={limit} filter={filterType} campaign={filterCampaign || campaign} contact={contact} />
              )}
            </SubscriptionLimitContainer>
          )}
        </NearBottomContainer>
      </div>
    )
  }
})

const CampaignFilterContainer = createContainer((props) => {
  const sub = Meteor.subscribe('campaign-refs')
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
  const { campaign, contact, filter, limit } = props
  const typesForFilter = {
    'All Activity': Posts.types,
    'Feedback': ['FeedbackPost'],
    'Coverage': ['CoveragePost'],
    'Need-to-knows': ['NeedToKnowPost'],
    'Updates': ['StatusUpdate', 'AddContactsToCampaign']
  }
  const types = typesForFilter[filter] || Posts.types
  const subs = [
    Meteor.subscribe('campaign-favourites'),
    Meteor.subscribe('posts', {
      campaign: campaign && campaign._id,
      contact: contact && contact._id,
      limit,
      types
    })
  ]

  const query = {
    type: {
      $in: types
    }
  }

  if (campaign) {
    query['campaigns._id'] = campaign._id
  }

  if (contact) {
    query['contacts._id'] = contact._id
  }

  const items = Posts.find(query, {
    sort: {
      createdAt: -1
    },
    limit
  }).fetch()
  const loading = subs.some((s) => !s.ready())

  return {
    loading,
    currentUser: Meteor.user(),
    contact,
    campaign,
    items,
    ...props
  }
}, ActivityList)

export default ActivityFeed
