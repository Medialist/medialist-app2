import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { SquareAvatar } from '../images/avatar'
import { MenuCampaignIcon } from '../images/icons'

const RecentCampaignsList = React.createClass({
  propTypes: {
    campaigns: PropTypes.array
  },
  render () {
    const { campaigns } = this.props
    if (!campaigns.length) return <p>No campaigns yet</p>
    return (
      <section className='block'>
        <header className='clearfix p4 border-gray80 border-bottom'>
          <Link to='/campaigns' className='f-sm semibold blue right' >See All</Link>
          <h1 className='m0 f-md semibold gray20 left'>
            <MenuCampaignIcon className='gray60' />
            <span className='ml1'>My Recent Campaigns</span>
          </h1>
        </header>
        <nav className='p3'>
          {campaigns.map(({ name, avatar, client, slug }) => (
            <Link to={`/campaign/${slug}`} className='block py1 mb2' title={name}>
              <SquareAvatar size={38} avatar={avatar} name={name} />
              <div className='inline-block align-middle'>
                <div className='ml3 semibold f-md gray10'>{name}</div>
                <div className='ml3 regular f-sm gray20' style={{marginTop: 2}}>{client.name}</div>
              </div>
            </Link>
          ))}
        </nav>
      </section>
    )
  }
})

export default RecentCampaignsList
