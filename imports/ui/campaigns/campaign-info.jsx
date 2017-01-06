import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import EditableAvatar from '../images/editable-avatar'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon, FavouritesIcon, FavouritesIconGold } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'
import AddToMasterList from '../lists/add-to-master-list'
import Tooltip from '../navigation/tooltip'

// Dummy data to be replaced with subscription data
const selectedMasterLists = [
  {_id: 0, label: 'Healthcare', slug: 'healthcare'},
  {_id: 0, label: 'Energy', slug: 'energy'}
]
const allMasterLists = [
  {_id: 0, label: 'Energy', slug: 'energy', count: 12},
  {_id: 0, label: 'Healthcare', slug: 'healthcare', count: 3},
  {_id: 0, label: 'Personal Fitness', slug: 'personal-fitness', count: 1},
  {_id: 0, label: 'Robotics', slug: 'robotics', count: 15},
  {_id: 0, label: 'Technology', slug: 'technology', count: 8},
  {_id: 0, label: 'Money and Glory', slug: 'money-and-glory'},
  {_id: 0, label: 'Quietness', slug: 'quietness'},
  {_id: 0, label: 'Fashion Bloggers', slug: 'fashion-bloggers', count: 7}
]
// END of dummy data

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    user: PropTypes.object,
    onEditClick: PropTypes.func
  },

  getInitialState () {
    return {
      addToMasterListOpen: false
    }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  onAddTeamMembers (e) {
    console.log('TODO: onAddTeamMembers')
  },

  onAddToMasterList (e) {
    this.setState({addToMasterListOpen: true})
  },

  dismissAddToMasterList () {
    this.setState({addToMasterListOpen: false})
  },

  onUpdateMasterList (payload) {
    console.log(payload)
  },

  onAddTags (e) {
    console.log('TODO: onAddTags')
  },

  onToggleFavourite () {
    Meteor.call('medialists/toggle-favourite', this.props.campaign.slug, (err) => {
      if (err) console.error('Could not toggle favourite status for campaign', err)
    })
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
    const {
      onAddTeamMembers,
      onAddToMasterList,
      onAddTags,
      dismissAddToMasterList,
      onUpdateMasterList,
      onAvatarChange,
      onAvatarError
    } = this
    const { addToMasterListOpen } = this.state
    const { onEditClick, user, campaign } = this.props
    const { name, avatar, purpose } = this.props.campaign
    const isFavourite = user.myMedialists.some((m) => m._id === campaign._id)
    const Icon = isFavourite ? FavouritesIconGold : FavouritesIcon
    const tooltip = isFavourite ? 'Remove from My Campaigns' : 'Add to My Campaigns'
    return (
      <div>
        <div className='mb1'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError}>
            <SquareAvatar size={70} avatar={avatar} name={name} />
          </EditableAvatar>
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl mb1'>
              {name}
              <Tooltip title={tooltip}>
                <Icon className='mx2 pointer svg-icon-lg align-bottom' onClick={this.onToggleFavourite} />
              </Tooltip>
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
        <AddToMasterList
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={onUpdateMasterList}
          selectedMasterLists={selectedMasterLists}
          allMasterLists={allMasterLists}
          title='Campaign' />
        <QuickAdd
          selectedMasterLists={selectedMasterLists}
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
          onAddToMasterList={onAddToMasterList}
          onAddTags={onAddTags} />
      </div>
    )
  }
})

export default CampaignInfo
