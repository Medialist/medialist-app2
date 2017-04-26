
import React, { PropTypes } from 'react'
import Modal from '../navigation/modal'
import { remove } from '/imports/api/campaigns/methods'
import AvatarList from '../lists/avatar-list'
import withSnackbar from '../snackbar/with-snackbar'
import DeleteConfirmation from '../navigation/delete-confirmation'

const DeleteCampaigns = withSnackbar(React.createClass({
  propTypes: {
    campaigns: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  onDelete () {
    remove.call({
      _ids: this.props.campaigns.map(campaigns => campaigns._id)
    }, (error) => {
      if (error) {
        console.error('Failed to delete campaigns', error)
        this.props.snackbar.error('batch-delete-campaigns-failure')
      } else {
        const name = this.props.campaigns.length > 1 ? `${this.props.campaigns.length} Campaigns` : this.props.campaigns[0].name

        this.props.snackbar.show(`Deleted ${name}`, 'batch-delete-campaigns-success')
      }

      this.props.onDelete()
    })
  },

  render () {
    return (
      <DeleteConfirmation type='Campaign' items={this.props.campaigns} onDelete={() => this.onDelete()} onDismiss={this.props.onDismiss}>
        <h3 className='normal f-xl m4'>Are you sure you want to <strong>delete {this.props.campaigns.length > 1 ? 'these campaigns' : 'this campaign'}</strong>?</h3>
        <AvatarList items={this.props.campaigns} maxAvatars={10} className='my4 px4' />
        <h4 className='normal f-xl'>Deleted campaigns can't be retrieved.</h4>
      </DeleteConfirmation>
    )
  }
}))

export default Modal(DeleteCampaigns, {
  width: 500,
  'data-id': 'delete-campaigns-modal'
})
