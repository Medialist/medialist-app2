import React, { PropTypes } from 'react'
import EditableAvatar from '../images/editable-avatar/index'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    onEditClick: PropTypes.func
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  onAddTeamMembers (e) {
    console.log('TODO: onAddTeamMembers')
  },

  onAddSectors (e) {
    console.log('TODO: onAddSectors')
  },

  onAddTags (e) {
    console.log('TODO: onAddTags')
  },

  onAvatarChange (e) {
    console.log('TODO: onAvatarChange', e.url)
    this.props.campaign.avatar = e.url
    this.forceUpdate()
  },

  onAvatarError (err) {
    console.error('Failed to change avatar', err)
    console.log('TODO: toast error message')
  },

  render () {
    if (!this.props.campaign) return null
    const { onAddTeamMembers, onAddSectors, onAddTags, onAvatarChange, onAvatarError } = this
    const { onEditClick } = this.props
    const { name, avatar, purpose } = this.props.campaign
    return (
      <div>
        <div className='mb1'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError}>
            <SquareAvatar size={70} avatar={avatar} name={name} />
          </EditableAvatar>
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl mb1'>{name}</span>
          </div>
        </div>
        <section>
          <InfoHeader name='Key Message' linkText='Edit campaign' onClick={onEditClick} />
          <div className='px2 py3'>
            <BioIcon className='inline-block' />
            <div className='inline-block pl3 f-sm gray10'>{purpose}</div>
          </div>
        </section>
        <section>
          <InfoHeader name='Team Members' onClick={onAddTeamMembers} />
          <div className='px2 py3'>
            <CircleAvatar style={{margin: '0 2px 2px 0'}} name={'fake one'} size={38} />
            <CircleAvatar name={'other one'} size={38} />
          </div>
        </section>
        <QuickAdd
          sectors={['Corporate', 'Media']}
          tags={[
            {
              _id: 'mongoidforamazon',
              name: 'Amazon',
              count: 43
            },
            {
              _id: 'mongoidforretail',
              name: 'Retail',
              count: 13
            }
          ]}
          onAddSectors={onAddSectors} onAddTags={onAddTags} />
      </div>
    )
  }
})

export default CampaignInfo
