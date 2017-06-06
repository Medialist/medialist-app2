import React from 'react'
import PropTypes from 'prop-types'
import Topbar from '/imports/ui/navigation/topbar'
import NavLink from '/imports/ui/navigation/nav-link'

const ContactTopbar = React.createClass({
  propTypes: {
    onAddToCampaignClick: PropTypes.func,
    contact: PropTypes.object
  },
  render () {
    const { contact, onAddToCampaignClick } = this.props
    if (!contact) return null
    return (
      <Topbar>
        <div className='inline-block border-gray80 border-right'>
          <NavLink to={`/contact/${contact.slug}`} onlyActiveOnIndex>Activity</NavLink>
          <NavLink to={`/contact/${contact.slug}/campaigns`}>Campaigns</NavLink>
        </div>
        <div className='px4 py3'>
          <button className='btn white bg-blue mx2' onClick={onAddToCampaignClick}>
            Add <FirstName contact={contact} /> to Campaign
          </button>
        </div>
      </Topbar>
    )
  }
})

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

export default ContactTopbar
