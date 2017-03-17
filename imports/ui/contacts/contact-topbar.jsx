import React, { PropTypes } from 'react'
import Topbar from '../navigation/topbar'
import NavLink from '../navigation/nav-link'
import AddContactsToCampaigns from './add-contacts-to-campaign'

const ContactTopbar = React.createClass({
  propTypes: {
    toggleAddToCampaign: PropTypes.func,
    addToCampaignOpen: PropTypes.bool,
    contact: PropTypes.object
  },
  render () {
    const { contact, toggleAddToCampaign, addToCampaignOpen } = this.props
    if (!contact) return null
    return (
      <Topbar>
        <div className='inline-block border-gray80 border-right'>
          <NavLink to={`/contact/${contact.slug}`} onlyActiveOnIndex>Activity</NavLink>
          <NavLink to={`/contact/${contact.slug}/campaigns`}>Campaigns</NavLink>
        </div>
        <div className='px4 py3'>
          <button className='btn white bg-blue mx2' onClick={toggleAddToCampaign}>
            Add <FirstName contact={contact} /> to Campaign
          </button>
        </div>
        <AddContactsToCampaigns
          title={`Add ${contact.name.split(' ')[0]} to a Campaign`}
          onDismiss={toggleAddToCampaign}
          open={addToCampaignOpen}
          contacts={[contact]} />
      </Topbar>
    )
  }
})

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

export default ContactTopbar
