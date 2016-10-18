import React, { PropTypes } from 'react'
import { SquareAvatar } from '../images/avatar'

const RecentCampaignsList = React.createClass({
  propTypes: {
    campaigns: PropTypes.array
  },

  render () {
    const { campaigns } = this.props
    if (!campaigns.length) return <p>No campaigns yet</p>
    return (
      <div>
        <h1>Recent Campaigns</h1>
        <ul>
          {campaigns.map(({ name, avatar }) => (
            <li>
              <SquareAvatar avatar={avatar} name={name} /> {name}
            </li>
          ))}
        </ul>
      </div>
    )
  }
})

export default RecentCampaignsList
