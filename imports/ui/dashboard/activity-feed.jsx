import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ActivityList from './activity-list'
import ActivityFilter, { filterNames } from './activity-filter'
import Posts from '/imports/api/posts/posts'

const ActivityFeed = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contact: PropTypes.object
  },

  getInitialState () {
    return { filterName: filterNames[0] }
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
