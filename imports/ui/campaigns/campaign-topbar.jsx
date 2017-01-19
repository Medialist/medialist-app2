import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'
import NavLink from '../navigation/nav-link'

const CampaignTopbar = React.createClass({
  propTypes: {
    backLinkText: PropTypes.string,
    onBackClick: PropTypes.func,
    campaign: PropTypes.object,
    onAddContactClick: PropTypes.func.isRequired
  },

  getDefaultProps () {
    return {
      backLinkText: 'Back'
    }
  },

  onBackClick () {
    if (this.props.onBackClick) return this.props.onBackClick()
    browserHistory.go(-1)
  },

  render () {
    const { onBackClick } = this
    const { backLinkText, campaign, onAddContactClick } = this.props

    return (
      <nav className='block bg-white mb4 flex items-center width-100 border-gray80 border-bottom'>
        <div className='flex-auto'>
          <span className='pointer inline-block p4 f-sm semibold' onClick={onBackClick}>{`${backLinkText}`}</span>
        </div>
        <div className='flex-none'>
          <div className='inline-block border-gray80 border-right'>
            <NavLink to={`/campaign/${campaign.slug}`} onlyActiveOnIndex>Activity View</NavLink>
            <NavLink to={`/campaign/${campaign.slug}/contacts`}>List View</NavLink>
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
