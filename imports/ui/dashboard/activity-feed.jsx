import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
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

const ActivityFeed = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contact: PropTypes.object
  },

  getInitialState () {
    return { activityFilter: TopActivityFilter }
  },

  onFilterChange (filter) {
    this.setState({ activityFilter: filter })
  },

  render () {
    const { campaign, contact } = this.props
    const { activityFilter } = this.state
    return (
      <div>
        <ItemFilter filter={activityFilter} filters={ACTIVITY_FILTERS} onChange={this.onFilterChange} />
        <ActivityListContainer filter={activityFilter} campaign={campaign} contact={contact} />
      </div>
    )
  }
})

const ActivityListContainer = createContainer((props) => {
  const limit = props.limit || 10
  let types = props.filter

  if (!types || types === TopActivityFilter) {
    types = ['need-to-knows', 'medialists changed', 'feedback']
  } else if (types === NeedToKnowFilter) {
    types = ['need-to-knows']
  } else if (types === CoverageFilter) {
    // TODO: chnage to coverage when we have some.
    types = ['feedback']
  }

  Meteor.subscribe('medialist-favourites')
  Meteor.subscribe('posts', { limit, types })
  const query = {}
  if (props.campaign) query.medialists = props.campaign.slug
  if (props.contact) query['contacts.slug'] = props.contact.slug
  const items = window.Posts.find(query, { sort: { createdAt: -1 }, limit }).fetch()
  return {
    currentUser: Meteor.user(),
    items,
    ...props
  }
}, ActivityList)

export default ActivityFeed
