import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import AvatarList from '/imports/ui/lists/avatar-list'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import DeleteConfirmation from '/imports/ui/navigation/delete-confirmation'

class DeleteContacts extends React.Component {
  static propTypes = {
    contacts: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  }

  render () {
    const { contacts, contactsCount, onDismiss, onDelete } = this.props
    const label = `delete ${contacts.length > 1 ? 'these contacts' : 'this contact'}`
    return (
      <DeleteConfirmation type='Contact' items={contacts} onDelete={onDelete} onDismiss={onDismiss}>
        <h3 className='normal f-xl m4'>Are you sure you want to <strong>{label}</strong>?</h3>
        <AvatarList items={contacts} maxAvatars={10} total={contactsCount} className='my4 px4' />
        <h4 className='normal f-xl'>Deleted contacts can't be retrieved.</h4>
      </DeleteConfirmation>
    )
  }
}

export default Modal(withSnackbar(DeleteContacts, {
  width: 500,
  'data-id': 'delete-contacts-modal'
}))
