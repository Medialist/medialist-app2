import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon, FavouritesIcon, FavouritesIconGold } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    user: PropTypes.object,
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

  onToggleFavourite () {
    Meteor.call('medialists/toggle-favourite', this.props.campaign.slug, (err) => {
      if (err) console.error('Could not toggle favourite status for campaign', err)
    })
  },

  render () {
    if (!this.props.campaign) return null
    const { onAddTeamMembers, onAddSectors, onAddTags } = this
    const { onEditClick, user, campaign } = this.props
    const { name, avatar, purpose } = this.props.campaign
    const Icon = user.profile.medialists.some((m) => m._id === campaign._id) ? FavouritesIconGold : FavouritesIcon
    return (
      <div>
        <div className='mb1'>
          <SquareAvatar className='ml2' size={70} avatar={avatar} name={name} />
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl mb1'>
              {name}
              <Icon className='ml2 pointer svg-icon-lg vertical-align-bottom' onClick={this.onToggleFavourite} />
            </span>
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
