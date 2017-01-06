import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import EditableAvatar from '../images/editable-avatar'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon, FavouritesIcon, FavouritesIconGold } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'
import AddToMasterList from '../lists/add-to-master-list'
import Tooltip from '../navigation/tooltip'
import { update } from '../../api/medialists/methods'

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
    onEditClick: PropTypes.func,
    onEditTeamClick: PropTypes.func
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

  onAddToMasterList (e) {
    this.setState({addToMasterListOpen: true})
  },

  onAddSectors (e) {
    console.log('TODO: onAddSectors')
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

  onAvatarChange (e) {
    const { _id } = this.props.campaign
    update.call({ _id, avatar: e.url }, (err) => {
      if (err) console.error('Failed to update campaign avatar', err)
    })
  },

  onAvatarError (err) {
    console.error('Failed to change avatar', err)
    console.log('TODO: toast error message')
  },

  onToggleFavourite () {
    Meteor.call('medialists/toggle-favourite', this.props.campaign.slug, (err) => {
      if (err) console.error('Could not toggle favourite status for campaign', err)
    })
  },

  render () {
    if (!this.props.campaign) return null
    const {
      onAddToMasterList,
      onAddTags,
      dismissAddToMasterList,
      onUpdateMasterList,
      onAvatarChange,
      onAvatarError,
      onToggleFavourite
    } = this
    const { addToMasterListOpen } = this.state
    const { onEditClick, onEditTeamClick, user, campaign } = this.props
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
                <Icon className='mx2 pointer svg-icon-lg align-bottom' onClick={onToggleFavourite} />
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
          <InfoHeader name='Team Members' onClick={onEditTeamClick} />
          <div className='px2 py3'>
            <TeamList campaign={campaign} />
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

const TeamList = ({ campaign }) => {
  const { team } = campaign

  if (!team || !team.length) {
    return <p className='f-xs normal gray60 center'>No team members yet</p>
  }

  return team.map(({ _id, name, avatar }) => {
    <CircleAvatar key={_id} avatar={avatar} style={{margin: '0 2px 2px 0'}} name={name} size={38} />
  })
}
