import React, { PropTypes } from 'react'
import Modal from '../navigation/modal'
import { removeContactsFromCampaign } from '/imports/api/contacts/methods'
import AvatarList from '../lists/avatar-list'

const RemoveContact = React.createClass({
  propTypes: {
    open: PropTypes.bool,
    contacts: PropTypes.array.isRequired,
    campaign: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  onDelete (event) {
    event.preventDefault()

    removeContactsFromCampaign.call({
      contactSlugs: this.props.contacts.map(contact => contact.slug),
      campaignSlug: this.props.campaign.slug
    })

    this.props.onDismiss(true)
  },

  onCancel (event) {
    event.preventDefault()

    this.props.onDismiss(false)
  },

  render () {
    return (
      <div data-id='remove-contact-from-campaign' className='relative'>
        <div className='center px4 pt4 pb6'>
          <h3 className='normal f-xl m4'>Are you sure you want to <strong>remove {this.props.contacts.length > 1 ? 'these contacts' : 'this contact'}</strong> from this campaign?</h3>
          <AvatarList items={this.props.contacts} maxAvatars='10' className='my4 px4' />
        </div>

        <div className='flex items-center p4 bg-white border-top border-gray80'>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={this.onCancel} data-id='cancel-remove-contact-from-campaign-button'>No, Keep Contact{this.props.contacts.length > 1 ? 's' : ''}</button>
            <button className='btn bg-not-interested white' onClick={this.onDelete} data-id='confirm-remove-contact-from-campaign-button'>Yes, Remove Contact{this.props.contacts.length > 1 ? 's' : ''}</button>
          </div>
        </div>
      </div>
    )
  }
})

export default Modal(RemoveContact, {
  width: 500
})
