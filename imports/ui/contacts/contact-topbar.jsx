import React, { PropTypes } from 'react'
import BackButton from '../navigation/back-button'
import AddContactsToCampaigns from './add-contacts-to-campaign'

const ContactTopbar = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onAddContactToCampaign: PropTypes.func.isRequired
  },

  render () {
    const { contact, open, onDismiss, onAddContactToCampaign } = this.props
    if (!contact) return null

    return (
      <nav className='block bg-white mb4 flex items-center shadow-inset-2'>
        <div className='flex-auto'>
          <BackButton>Back</BackButton>
        </div>
        <div className='flex-none border-left border-gray80 px4 py3'>
          <button type='button' className='btn white bg-blue mx2' onClick={onAddContactToCampaign}>
            Add <FirstName contact={contact} /> to Campaign
          </button>
        </div>
        <AddContactsToCampaigns
          title={`Add ${contact.name.split(' ')[0]} to a Campaign`}
          open={open}
          onDismiss={onDismiss}
          contacts={[contact]} />
      </nav>
    )
  }
})

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

export default ContactTopbar
