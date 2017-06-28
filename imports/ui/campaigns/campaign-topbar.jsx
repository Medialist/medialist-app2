import React from 'react'
import PropTypes from 'prop-types'
import Topbar from '/imports/ui/navigation/topbar'
import NavLink from '/imports/ui/navigation/nav-link'

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
        <button type='button' className='btn white bg-blue mx6' onClick={onAddContactClick} data-id='add-contacts-to-campaign-button'>
          Add Contacts to this Campaign
        </button>
      </Topbar>
    )
  }
})

export default CampaignTopbar
