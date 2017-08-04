import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ActivityList from '/imports/ui/dashboard/activity-list'
import CampaignFilter from '/imports/ui/dashboard/campaign-filter'
import ActivityFilter, { filterNames } from '/imports/ui/dashboard/activity-filter'
import Posts from '/imports/api/posts/posts'
import Campaigns from '/imports/api/campaigns/campaigns'
import NearBottomContainer from '/imports/ui/navigation/near-bottom-container'
import SubscriptionLimitContainer from '/imports/ui/navigation/subscription-limit-container'

const ActivityFeed = React.createClass({
  propTypes: {
    campaigns: PropTypes.array,
    campaign: PropTypes.object,
    contact: PropTypes.object,
    'data-id': PropTypes.string,
    contacts: PropTypes.array
  },

  getInitialState () {
    return {
      filterType: filterNames[0],
      filterCampaign: null
    }
  },

  onFilterChange (filterType) {
    this.setState({ filterType })

    if (filterType === 'Need-to-knows') {
      this.setState({
        filterCampaign: null
      })
    }
  },

  onCampaignFilterChange (filterCampaign) {
    this.setState({ filterCampaign })
  },

  render () {
    const { onFilterChange, onCampaignFilterChange } = this
    const { contact, campaign, contacts, campaigns } = this.props
    const { filterType, filterCampaign } = this.state

    return (
      <div data-id={this.props['data-id']}>
        <div className='flex justify-start items-center pb3'>
          <ActivityFilter
            selected={filterType}
            onChange={onFilterChange}
            campaign={campaign} />
          {!campaign && <span className='gray80 flex-none'>|</span>}
          {!campaign && <CampaignFilterContainer
            disabled={filterType === filterNames[3]}
            contact={contact}
            initialCampaignFilter={filterCampaign}
            onCampaignFilter={onCampaignFilterChange}
          />}
          <hr className='flex-auto pl2' style={{height: 1}} />
        </div>
        <NearBottomContainer>
          {(nearBottom) => (
            <SubscriptionLimitContainer wantMore={nearBottom}>
              {(limit) => (
                <ActivityListContainer
                  limit={limit}
                  filter={filterType}
                  campaign={filterCampaign || campaign}
                  contact={contact}
                  contacts={contacts}
                  campaigns={campaigns} />
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

  if (props.contact) {
    query.slug = {
      $in: Object.keys(props.contact.campaigns)
    }
  }

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
