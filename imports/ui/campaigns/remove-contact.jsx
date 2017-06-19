import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import { removeContactsFromCampaigns } from '/imports/api/contacts/methods'
import AvatarList from '/imports/ui/lists/avatar-list'

class RemoveContact extends React.Component {
  static contextTypes = {
    snackbar: PropTypes.shape({
      show: PropTypes.func.isRequired,
      error: PropTypes.func.isRequired
    }).isRequired
  }

  static propTypes = {
    contacts: PropTypes.array.isRequired,
    campaigns: PropTypes.array.isRequired,
    avatars: PropTypes.array.isRequired
  }

  onDelete = (event) => {
    event.preventDefault()

    removeContactsFromCampaigns.call({
      contactSlugs: this.props.contacts.map(contact => contact.slug),
      campaignSlugs: this.props.campaigns.map(campaign => campaign.slug)
    }, (error) => {
      if (error) {
        console.error('Failed to remove contacts from campaign', error)

        this.context.snackbar.error('batch-remove-contacts-from-campaign-failure')

        return
      }

      this.context.snackbar.show(`Removed ${this.props.contacts.length} Contact${this.props.contacts.length > 1 ? 's' : ''} from Campaign`, 'batch-remove-contacts-from-campaign-success')
      this.props.onDelete()
    })
  }

  render () {
    const contact = this.props.contacts.length > 1 ? 'these contacts' : this.props.contacts[0].name
    const campaign = this.props.campaigns.length > 1 ? 'these campaigns' : this.props.campaigns[0].name

    return (
      <div className='relative'>
        <div className='center px4 pt4 pb6'>
          <h3 className='normal f-xl m4'>Are you sure you want to <strong>remove {contact}</strong> from {campaign}?</h3>
          <AvatarList items={this.props.avatars} maxAvatars={10} className='my4 px4' />
        </div>

        <div className='flex items-center p4 bg-white border-top border-gray80'>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={this.props.onDismiss} data-id='cancel-button'>No, Keep Contact{this.props.contacts.length > 1 ? 's' : ''}</button>
            <button className='btn bg-not-interested white' onClick={this.onDelete} data-id='confirm-button'>Yes, Remove Contact{this.props.contacts.length > 1 ? 's' : ''}</button>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal(RemoveContact, {
  width: 500,
  'data-id': 'remove-contacts-from-campaigns-modal'
})
