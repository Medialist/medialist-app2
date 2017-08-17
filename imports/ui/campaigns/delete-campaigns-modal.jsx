import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import DeleteConfirmation from '/imports/ui/navigation/delete-confirmation'

class DeleteCampaigns extends React.Component {
  static propTypes = {
    campaigns: PropTypes.array.isRequired,
    campaignsCount: PropTypes.number.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  }

  render () {
    const {campaigns, campaignsCount, onDelete, onDismiss} = this.props
    return (
      <DeleteConfirmation type='Campaign' items={campaigns} onDelete={onDelete} onDismiss={onDismiss}>
        <h3 className='normal f-xl m4'>Are you sure you want to <strong>delete {campaigns.length > 1 ? 'these campaigns' : 'this campaign'}</strong>?</h3>
        <AbbreviatedAvatarList items={campaigns} maxAvatars={10} className='my4 px4' shape='square' total={campaignsCount} />
        <h4 className='normal f-xl'>Deleted campaigns can't be retrieved.</h4>
      </DeleteConfirmation>
    )
  }
}

export default Modal(DeleteCampaigns, {
  overflowY: 'visible',
  width: 500,
  'data-id': 'delete-campaigns-modal'
})
