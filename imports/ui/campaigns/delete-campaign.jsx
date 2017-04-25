import React, { PropTypes } from 'react'
import Modal from '../navigation/modal'
import { remove } from '/imports/api/campaigns/methods'
import AvatarList from '../lists/avatar-list'
import withSnackbar from '../snackbar/with-snackbar'

const DeleteCampaigns = withSnackbar(React.createClass({
  propTypes: {
    campaigns: PropTypes.array.isRequired
  },

  onDelete (event) {
    event.preventDefault()

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

      this.props.onDismiss()
    })
  },

  render () {
    return (
      <div className='relative'>
        <div className='center px4 pt4 pb6'>
          <h3 className='normal f-xl m4'>Are you sure you want to <strong>delete {this.props.campaigns.length > 1 ? 'these campaigns' : 'this campaign'}</strong>?</h3>
          <AvatarList items={this.props.campaigns} maxAvatars={10} className='my4 px4' />
        </div>

        <div className='flex items-center p4 bg-white border-top border-gray80'>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={this.props.onDismiss} data-id='cancel-delete-campaigns-button'>No, Keep Campaign{this.props.campaigns.length > 1 ? 's' : ''}</button>
            <button className='btn bg-not-interested white' onClick={this.onDelete} data-id='confirm-delete-campaigns-button'>Yes, Delete Campaign{this.props.campaigns.length > 1 ? 's' : ''}</button>
          </div>
        </div>
      </div>
    )
  }
}))

export default Modal(DeleteCampaigns, {
  width: 500,
  'data-id': 'delete-campaigns-modal'
})
