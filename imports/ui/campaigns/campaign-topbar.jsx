import React, { PropTypes } from 'react'
import NavLink from '../navigation/nav-link'
import BackButton from '../navigation/back-button'

const CampaignTopbar = React.createClass({
  propTypes: {
    backLinkText: PropTypes.string,
    campaign: PropTypes.object,
    onAddContactClick: PropTypes.func.isRequired
  },

  getDefaultProps () {
    return {
      backLinkText: 'Back'
    }
  },

  render () {
    const { backLinkText, campaign, onAddContactClick } = this.props
    return (
      <nav className='block bg-white mb4 flex items-center width-100 border-gray80 border-bottom'>
        <div className='flex-auto'>
          <BackButton>{backLinkText}</BackButton>
        </div>
        <div className='flex-none'>
          <div className='inline-block border-gray80 border-right'>
            <NavLink to={`/campaign/${campaign.slug}`} onlyActiveOnIndex>Activity</NavLink>
            <NavLink to={`/campaign/${campaign.slug}/contacts`}>Contacts</NavLink>
          </div>
          <button type='button' className='btn white bg-blue mx6' onClick={onAddContactClick}>
            Add Contacts to Campaign
          </button>
        </div>
      </nav>
    )
  }
})

export default CampaignTopbar
