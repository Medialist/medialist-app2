import React from 'react'
import PropTypes from 'prop-types'
import Topbar from '/imports/ui/navigation/topbar'
import NavLink from '/imports/ui/navigation/nav-link'

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

const ContactTopbar = ({ contact, onAddToCampaignClick }) => {
  return (
    <Topbar>
      <div className='inline-block border-gray80 border-right'>
        <NavLink to={`/contact/${contact.slug}`} onlyActiveOnIndex>Activity</NavLink>
        <NavLink to={`/contact/${contact.slug}/campaigns`}>Campaigns</NavLink>
      </div>
      <div className='px4 inline-block'>
        <button className='btn white bg-blue mx2' onClick={onAddToCampaignClick}>
          Add <FirstName contact={contact} /> to a Campaign
        </button>
      </div>
    </Topbar>
  )
}

ContactTopbar.propTypes = {
  onAddToCampaignClick: PropTypes.func.isRequired,
  contact: PropTypes.object.isRequired
}

export default ContactTopbar
