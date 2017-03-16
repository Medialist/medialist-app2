import React, { PropTypes } from 'react'
import Topbar from '../navigation/topbar'
import NavLink from '../navigation/nav-link'
import AddContactsToCampaigns from './add-contacts-to-campaign'

const ContactTopbar = React.createClass({
  propTypes: {
    contact: PropTypes.object
  },
  getInitialState () {
    return {
      addContactModalOpen: false
    }
  },
  render () {
    const { contact } = this.props
    const { addContactModalOpen } = this.state
    if (!contact) return null
    return (
      <Topbar>
        <div className='inline-block border-gray80 border-right'>
          <NavLink to={`/contact/${contact.slug}`} onlyActiveOnIndex>Activity</NavLink>
          <NavLink to={`/contact/${contact.slug}/campaigns`}>Campaigns</NavLink>
        </div>
        <div className='px4 py3'>
          <button className='btn white bg-blue mx2' onClick={() => this.setState({addContactModalOpen: true})}>
            Add <FirstName contact={contact} /> to Campaign
          </button>
        </div>
        <AddContactsToCampaigns
          title={`Add ${contact.name.split(' ')[0]} to a Campaign`}
          onDismiss={() => this.setState({addContactModalOpen: false})}
          open={addContactModalOpen}
          contacts={[contact]} />
      </Topbar>
    )
  }
})

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

export default ContactTopbar
