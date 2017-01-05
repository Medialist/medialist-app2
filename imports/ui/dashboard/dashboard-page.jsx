import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import RecentCampaignsList from './recent-campaigns-list'
import RecentContactsList from './recent-contacts-list'
import ActivityFeed from './activity-feed'

const DashboardPage = React.createClass({
  propTypes: {
    recentCampaigns: PropTypes.array,
    recentContacts: PropTypes.array
  },

  render () {
    const { recentCampaigns, recentContacts } = this.props
    return (
      <div className='flex max-width-lg mx-auto my4 py1'>
        <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
          <RecentCampaignsList campaigns={recentCampaigns} />
          <RecentContactsList contacts={recentContacts} />
        </div>
        <div className='flex-auto px2'>
          <ActivityFeed />
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  Meteor.subscribe('contacts')
  return {
    recentCampaigns: window.Meteor.user().myMedialists.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    recentContacts: window.Meteor.user().myContacts.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)
  }
}, DashboardPage)
