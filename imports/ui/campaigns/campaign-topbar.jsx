import React from 'react'
import PropTypes from 'prop-types'
import Topbar from '/imports/ui/navigation/topbar'
import NavLink from '/imports/ui/navigation/nav-link'

const CampaignTopbar = ({ backLinkText, campaign, onAddContactClick }) => {
  return (
    <Topbar backLinkText={backLinkText}>
      <div className='inline-block border-gray80 border-right'>
        <div>
          <NavLink to={`/campaign/${campaign.slug}`} onlyActiveOnIndex>Activity</NavLink>
          <NavLink to={`/campaign/${campaign.slug}/contacts`}>Contacts</NavLink>
        </div>
      </div>
      <button type='button' className='btn white bg-blue mx6' onClick={onAddContactClick} data-id='add-contacts-to-campaign-button'>
        Add Contacts to this Campaign
      </button>
    </Topbar>
  )
}

CampaignTopbar.propTypes = {
  backLinkText: PropTypes.string,
  campaign: PropTypes.object.isRequired,
  onAddContactClick: PropTypes.func.isRequired
}

export default CampaignTopbar
