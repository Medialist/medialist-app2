import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'

class MergeContacts extends React.Component {
  static propTypes = {
    contacts: PropTypes.array.isRequired
  }

  render () {
    const {
      contacts
    } = this.props

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center mt6'>Merge these Contacts</div>
        <div className='mb6'>
          <AbbreviatedAvatarList items={contacts} maxTooltip={12} total={contacts.length} />
        </div>
        <div className='border-top border-gray80 px7 pt3 pb6'>
          <label className='block gray40 semibold f-sm pt4 mb2'>
            {`You are merging ${contacts.length} contacts. Select the information you'd like to keep`}
          </label>
          <label className='block gray40 semibold f-sm pt4 mb2'>Name</label>
          <label className='block gray40 semibold f-sm pt4 mb2'>Jobs</label>
        </div>
        <div className='flex p4 bg-white border-top border-gray80'>
          <div className='flex-auto flex order-last' style={{justifyContent: 'flex-end'}}>
            <button className='btn bg-completed white order-last' onClick={this.props.onSubmit} data-id='merge-contacts-form-submit-button'>Save</button>
            <button className='btn bg-transparent gray40 mr2' onClick={this.props.onCancel} data-id='merge-contacts-form-cancel-button'>Cancel</button>
          </div>
          <div className='flex-auto'>
            <label className='btn bg-transparent red'>Merging contacts cannot be undone</label>
          </div>
        </div>
      </div>
    )
  }
}

export default withSnackbar(Modal(MergeContacts, {
  'data-id': 'merge-contact-modal'
}))
