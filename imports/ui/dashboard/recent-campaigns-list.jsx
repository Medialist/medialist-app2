import React, { PropTypes } from 'react'
import { SquareAvatar } from '../images/avatar'
import { Link } from 'react-router'

const RecentCampaignsList = React.createClass({
  propTypes: {
    campaigns: PropTypes.array
  },

  render () {
    const { campaigns } = this.props
    if (!campaigns.length) return <p>No campaigns yet</p>
    return (
      <section className='block'>
        <header className='clearfix p3 border-gray80 border-bottom'>
          <Link to='/campaigns' className='f-sm semibold blue right' >See all</Link>
          <h1 className='m0 f-md semibold gray20 left'>My Recent Campaigns</h1>
        </header>
        <ul className='list-reset px3 pt1'>
          {campaigns.map(({ name, avatar }) => (
            <li className='py1 mb1'>
              <SquareAvatar avatar={avatar} name={name} />
              <span className='ml3'>{name}</span>
            </li>
          ))}
        </ul>
      </section>
    )
  }
})

export default RecentCampaignsList
