import React, { PropTypes } from 'react'
import Modal from '../navigation/modal'
import AvatarList from '../lists/avatar-list'
import withSnackbar from '../snackbar/with-snackbar'
import DeleteConfirmation from '../navigation/delete-confirmation'
import { batchRemoveContacts } from '/imports/api/contacts/methods'

const DeleteContacts = withSnackbar(React.createClass({
  propTypes: {
    contacts: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  onDelete () {
    batchRemoveContacts.call({
      _ids: this.props.contacts.map((s) => s._id)
    }, (error) => {
      if (error) {
        console.log(error)
        this.props.snackbar.error('batch-delete-contacts-failure')
      } else {
        const name = this.props.contacts.length > 1 ? `${this.props.contacts.length} Contacts` : this.props.contacts[0].name

        this.props.snackbar.show(`Deleted ${name}`, 'batch-delete-contacts-success')
      }

      this.props.onDelete()
    })
  },

  render () {
    return (
      <DeleteConfirmation type='Contact' items={this.props.contacts} onDelete={() => this.onDelete()} onDismiss={this.props.onDismiss}>
        <h3 className='normal f-xl m4'>Are you sure you want to <strong>delete {this.props.contacts.length > 1 ? 'these contacts' : 'this contact'}</strong>?</h3>
        <AvatarList items={this.props.contacts} maxAvatars={10} className='my4 px4' />
        <h4 className='normal f-xl'>Deleted contacts can't be retrieved.</h4>
      </DeleteConfirmation>
    )
  }
}))

export default Modal(DeleteContacts, {
  width: 500,
  'data-id': 'delete-contacts-modal'
})
