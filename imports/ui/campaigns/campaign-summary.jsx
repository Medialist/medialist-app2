import React from 'react'
import PropTypes from 'prop-types'
import values from 'lodash.values'
import { SquareAvatar } from '/imports/ui/images/avatar'
import EditableAvatar from '/imports/ui/images/editable-avatar'
import { updateCampaign } from '/imports/api/campaigns/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import StatusStats from '/imports/ui/contacts/status-stats'

const CamapignSummary = withSnackbar(React.createClass({
  propTypes: {
    snackbar: PropTypes.object,
    campaign: PropTypes.object,
    statusFilter: PropTypes.string,
    onStatusClick: PropTypes.func
  },
  onAvatarChange (e) {
    const { _id } = this.props.campaign
    updateCampaign.call({ _id, avatar: e.url }, (error) => {
      if (error) {
        console.error('Failed to update campaign avatar', error)
        this.props.snackbar.error('campaign-avatar-update-error')
      }
    })
  },
  onAvatarError (error) {
    console.error('Failed to change avatar', error)
    this.props.snackbar.error('campaign-avatar-update-error')
  },
  render () {
    const { onAvatarError, onAvatarChange } = this
    const { campaign, statusFilter, onStatusClick } = this.props
    const { contacts, name, avatar, client } = campaign
    const statuses = values(contacts || [])
    return (
      <div className='flex items-center pt4 pb2 pr2 pl6'>
        <div className='flex-auto'>
          <div className='flex items-center'>
            <EditableAvatar avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuLeft={0} menuTop={-20}>
              <SquareAvatar className='flex-none' size={40} avatar={avatar} name={name} />
            </EditableAvatar>
            <div className='flex-auto ml3' style={{lineHeight: 1.4}}>
              <div className='f-xl semibold gray10 truncate'>{name}</div>
              <div className='f-sm normal gray10 truncate'>{client && client.name}</div>
            </div>
          </div>
        </div>
        <StatusStats className='flex-none' statuses={statuses} active={statusFilter} onStatusClick={(status) => onStatusClick(status)} />
      </div>
    )
  }
}))

export default CamapignSummary
