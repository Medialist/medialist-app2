import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import RecentCampaignsList from './recent-campaigns-list'
import RecentContactsList from './recent-contacts-list'
import ActivityList from './activity-list'
import ItemFilter from '../lists/item-filter'
import {
  TopActivityFilter,
  CoverageFilter,
  NeedToKnowFilter
} from './activity-filters'

const ACTIVITY_FILTERS = [
  TopActivityFilter,
  CoverageFilter,
  NeedToKnowFilter
]

const DashboardPage = React.createClass({
  propTypes: {
    recentCampaigns: PropTypes.array,
    recentContacts: PropTypes.array
  },

  getInitialState () {
    return { activityFilter: TopActivityFilter }
  },

  onFilterChange (filter) {
    this.setState({ activityFilter: filter })
  },

  render () {
    const { recentCampaigns, recentContacts } = this.props

    return (
      <div className='flex max-width-lg mx-auto'>
        <div className='flex-none' style={{width: 250}}>
          <RecentCampaignsList campaigns={recentCampaigns} />
          <RecentContactsList contacts={recentContacts} />
        </div>
        <div className='flex-auto ml4 px2'>
          <ItemFilter filter={this.state.activityFilter} filters={ACTIVITY_FILTERS} onChange={this.onFilterChange} />
          <ActivityListContainer filter={this.state.activityFilter} />
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  return {
    recentCampaigns: window.Medialists.find({}, { limit: 5, sort: { updatedAt: -1 } }).fetch(),
    recentContacts: []
  }
}, DashboardPage)

const ActivityListContainer = createContainer((props) => {
  const limit = props.limit || 10
  let types = props.filter

  if (!types || types === TopActivityFilter) {
    types = ['need-to-knows', 'medialists changed', 'feedback']
  } else if (types === NeedToKnowFilter) {
    types = ['need-to-knows']
  } else if (types === CoverageFilter) {
    types = ['feedback']
  }

  Meteor.subscribe('medialist-favourites')
  Meteor.subscribe('posts', { limit, types })

  const items = window.Posts.find({}, { sort: { createdAt: -1 }, limit }).fetch()
  return {
    currentUser: Meteor.user(),
    items,
    ...props
  }
}, ActivityList)
