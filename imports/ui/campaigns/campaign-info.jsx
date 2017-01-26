import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import EditableAvatar from '../images/editable-avatar'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon, FavouritesIcon, FavouritesIconGold, WebsiteIcon } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'
import AddToMasterList from '../lists/add-to-master-list'
import AddTags from '../tags/add-tags'
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
const selectedTags = [
  {_id: 0, name: 'Appropsal', slug: 'appropsal', count: 3},
  {_id: 0, name: 'Attract', slug: 'attract', count: 8},
  {_id: 0, name: 'Bees', slug: 'bees', count: 1},
  {_id: 0, name: 'Burner', slug: 'burner', count: 1}
]
const allTags = [
  {_id: 0, name: 'Apples', slug: 'apples', count: 12},
  {_id: 0, name: 'Appropsal', slug: 'appropsal', count: 3},
  {_id: 0, name: 'Attitude', slug: 'attitude', count: 1},
  {_id: 0, name: 'Atack', slug: 'atack', count: 15},
  {_id: 0, name: 'Attract', slug: 'attract', count: 8},
  {_id: 0, name: 'Bees', slug: 'bees', count: 1},
  {_id: 0, name: 'Burner', slug: 'burner', count: 1},
  {_id: 0, name: 'Bloggers', slug: 'bloggers', count: 7}
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
      addToMasterListOpen: false,
      addTagsOpen: false
    }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
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

  onAddTags () {
    this.setState({addTagsOpen: true})
  },

  dismissAddTags () {
    this.setState({addTagsOpen: false})
  },

  onUpdateTags (tags) {
    console.log(tags)
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
      onToggleFavourite,
      dismissAddTags,
      onUpdateTags
    } = this
    const { addToMasterListOpen, addTagsOpen } = this.state
    const { onEditClick, onEditTeamClick, user, campaign } = this.props
    const { name, client, avatar, purpose, links, team } = this.props.campaign
    const isFavourite = user.myMedialists.some((m) => m._id === campaign._id)
    const Icon = isFavourite ? FavouritesIconGold : FavouritesIcon
    const tooltip = isFavourite ? 'Remove from My Campaigns' : 'Add to My Campaigns'
    return (
      <div>
        <div className='flex items-start mb1'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} arrowPosition={'25%'}>
            <SquareAvatar size={70} avatar={avatar} name={name} />
          </EditableAvatar>
          <div className='ml3 flex-auto'>
            <div className='semibold block f-xl mb1' style={{ marginTop: '-3px' }}>
              {name}
              <Tooltip title={tooltip}>
                <Icon className='mx1 pointer svg-icon-lg align-bottom' onClick={onToggleFavourite} />
              </Tooltip>
            </div>
            <div className='f-sm gray10 mb2'>{client && client.name}</div>
            <div>
              {(links || []).map((link) => (
                <span className='mr2 hover-fill-trigger'>
                  <Tooltip title={prettyUrl(link.url)} key={link.url}>
                    <a href={link.url} target='_blank'>
                      <WebsiteIcon className='svg-icon-md' />
                    </a>
                  </Tooltip>
                </span>
              ))}
            </div>
          </div>
        </div>
        <section>
          <InfoHeader name='Key Message' linkText='Edit campaign' onClick={onEditClick} />
          <div className='px2 py3 flex'>
            <BioIcon className='inline-block' />
            <div className='inline-block pl3 f-sm gray10 flex-auto'>{purpose}</div>
          </div>
        </section>
        <section>
          <InfoHeader name='Team Members' onClick={onEditTeamClick} />
          <div className='px2 py3'>
            {team.map((teamMember, ind) => <CircleAvatar {...teamMember} size={38} style={{marginLeft: '2px'}} />)}
          </div>
        </section>
        <AddToMasterList
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={onUpdateMasterList}
          selectedMasterLists={selectedMasterLists}
          allMasterLists={allMasterLists}
          title='Campaign' />
        <AddTags
          open={addTagsOpen}
          onDismiss={dismissAddTags}
          title={`Tag the ${name} Campaign`}
          selectedTags={selectedTags}
          allTags={allTags}
          onUpdateTags={onUpdateTags} />
        <QuickAdd
          selectedMasterLists={selectedMasterLists}
          tags={selectedTags}
          onAddToMasterList={onAddToMasterList}
          onAddTags={onAddTags} />
      </div>
    )
  }
})

function prettyUrl (url) {
  url = url.replace(/^https?:\/\//i, '')
  return url[url.length - 1] === '/' ? url.slice(0, -1) : url
}

export default CampaignInfo
