import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { MenuCampaignIcon, ChevronRight } from '../images/icons'
import CampaignPreview from '../campaigns/campaign-preview'

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
            ? campaigns.map((campaign) => (
              <Link key={campaign.slug} to={`/campaign/${campaign.slug}`} className='block py1 mb2' title={campaign.name}>
                <CampaignPreview {...campaign} />
              </Link>
            ))
            : (
              <Link
                to='/campaigns?createCampaign=true'
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
