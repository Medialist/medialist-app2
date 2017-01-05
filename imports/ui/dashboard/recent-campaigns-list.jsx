import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import moment from 'moment'
import { SquareAvatar } from '../images/avatar'
import { MenuCampaignIcon, ChevronRight } from '../images/icons'

const RecentCampaignsList = React.createClass({
  propTypes: {
    campaigns: PropTypes.array
  },
  render () {
    const { campaigns } = this.props
    return (
      <section className='block'>
        <header className='clearfix p4 border-gray80 border-bottom'>
          <Link to='/campaigns' className='f-sm semibold blue right' >See All <ChevronRight /></Link>
          <h1 className='m0 f-md semibold gray20 left'>
            <MenuCampaignIcon className='gray60' />
            <span className='ml1'>My Recent Campaigns</span>
          </h1>
        </header>
        <nav className='p3'>
          {campaigns.length
            ? campaigns.map(({ name, avatar, clientName, updatedAt, slug }) => (
              <Link key={slug} to={`/campaign/${slug}`} className='block py1 mb2' title={name}>
                <SquareAvatar size={38} avatar={avatar} name={name} />
                <div className='inline-block align-middle'>
                  <div className='ml3 semibold f-md gray10'>{name}</div>
                  <div className='ml3 regular f-sm gray20' style={{marginTop: 2}}>
                    {clientName} <span className='gray40'>&ndash; Updated {moment(updatedAt).fromNow()}</span>
                  </div>
                </div>
              </Link>
            ))
            : (
              <Link
                to='/campaigns?editCampaignOpen=true'
                className='block py1 pl1 underline semibold blue'
                style={{ marginLeft: '21px' }}
                title='Create a new campaign'>
                  Create a new campaign
              </Link>)
          }
        </nav>
      </section>
    )
  }
})

export default RecentCampaignsList
