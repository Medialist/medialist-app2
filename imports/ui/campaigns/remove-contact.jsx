import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import { removeContactsFromCampaign } from '/imports/api/contacts/methods'
import AvatarList from '/imports/ui/lists/avatar-list'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'

const RemoveContact = withSnackbar(React.createClass({
  propTypes: {
    contacts: PropTypes.array.isRequired,
    campaign: PropTypes.object.isRequired
  },

  onDelete (event) {
    event.preventDefault()

    removeContactsFromCampaign.call({
      contactSlugs: this.props.contacts.map(contact => contact.slug),
      campaignSlug: this.props.campaign.slug
    }, (error) => {
      if (error) {
        console.error('Failed to remove contacts from campaign', error)

        this.props.snackbar.error('batch-remove-contacts-from-campaign-failure')

        return
      }

      this.props.snackbar.show(`Removed ${this.props.contacts.length} Contact${this.props.contacts.length > 1 ? 's' : ''} from Campaign`, 'batch-remove-contacts-from-campaign-success')
      this.props.onDismiss()
    })
  },

  render () {
    return (
      <div className='relative'>
        <div className='center px4 pt4 pb6'>
          <h3 className='normal f-xl m4'>Are you sure you want to <strong>remove {this.props.contacts.length > 1 ? 'these contacts' : 'this contact'}</strong> from this campaign?</h3>
          <AvatarList items={this.props.contacts} maxAvatars={10} className='my4 px4' />
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
}))

export default Modal(RemoveContact, {
  width: 500,
  'data-id': 'remove-contacts-modal'
})
