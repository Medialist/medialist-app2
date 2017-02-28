import React, { PropTypes } from 'react'
import Topbar from '../navigation/topbar'
import NavLink from '../navigation/nav-link'

const CampaignTopbar = React.createClass({
  propTypes: {
    backLinkText: PropTypes.string,
    campaign: PropTypes.object,
    onAddContactClick: PropTypes.func.isRequired
  },
  render () {
    const { backLinkText, campaign, onAddContactClick } = this.props
    return (
      <Topbar backLinkText={backLinkText}>
        <div className='inline-block border-gray80 border-right'>
          <NavLink to={`/campaign/${campaign.slug}`} onlyActiveOnIndex>Activity</NavLink>
          <NavLink to={`/campaign/${campaign.slug}/contacts`}>Contacts</NavLink>
        </div>
        <button type='button' className='btn white bg-blue mx6' onClick={onAddContactClick}>
          Add Contacts to Campaign
        </button>
      </Topbar>
    )
  }
})

export default CampaignTopbar
