import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ActivityList from './activity-list'
import ActivityFilter from './activity-filter'

const ActivityFeed = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contact: PropTypes.object
  },

  getInitialState () {
    return { filterName: 'Top Activity' }
  },

  onFilterChange (filterName) {
    this.setState({ filterName })
  },

  render () {
    const { campaign, contact } = this.props
    const { filterName } = this.state
    return (
      <div>
        <ActivityFilter selected={filterName} onChange={this.onFilterChange} />
        <ActivityListContainer filter={filterName} campaign={campaign} contact={contact} />
      </div>
    )
  }
})

const ActivityListContainer = createContainer((props) => {
  const limit = props.limit || 10
  const typesForFilter = {
    'Top Activity': ['need-to-knows', 'campaigns changed', 'feedback', 'campaign created'],
    'Coverage': ['coverage'],
    'Need To Know': ['need-to-knows']
  }
  const types = typesForFilter[props.filter]

  Meteor.subscribe('campaign-favourites')
  Meteor.subscribe('posts', { limit, types })
  const query = {}
  if (props.campaign) query.campaigns = props.campaign.slug
  if (props.contact) query['contacts.slug'] = props.contact.slug
  const items = window.Posts.find(query, { sort: { createdAt: -1 }, limit }).fetch()
  return {
    currentUser: Meteor.user(),
    items,
    ...props
  }
}, ActivityList)

export default ActivityFeed
