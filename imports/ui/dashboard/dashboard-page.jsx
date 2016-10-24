import React, { PropTypes } from 'react'
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
      <div className='flex max-width-lg mx-auto my4'>
        <div className='flex-none mr4 xs-hide sm-hide' style={{width: 250}}>
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
  return {
    recentCampaigns: window.Medialists.find({}, { limit: 5, sort: { updatedAt: -1 } }).fetch(),
    recentContacts: []
  }
}, DashboardPage)
