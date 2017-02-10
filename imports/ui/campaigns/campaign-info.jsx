import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import EditableAvatar from '../images/editable-avatar'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon, FavouritesIcon, FavouritesIconGold, WebsiteIcon } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'
import AddToMasterList from '../master-lists/add-to-master-list.jsx'
import AddTags from '../tags/add-tags'
import Tooltip from '../navigation/tooltip'
import { update } from '../../api/medialists/methods'

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    user: PropTypes.object,
    onEditClick: PropTypes.func,
    onEditTeamClick: PropTypes.func,
    onAddCampaignToMasterLists: PropTypes.func
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
      onAvatarChange,
      onAvatarError,
      onToggleFavourite,
      dismissAddTags,
      onUpdateTags
    } = this
    const { addToMasterListOpen, addTagsOpen } = this.state
    const { onEditClick, onEditTeamClick, user, campaign, onAddCampaignToMasterLists } = this.props
    const { name, client, avatar, purpose, links, team, tags, masterLists } = this.props.campaign
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
              {(links || []).map((link, ind) => (
                <span className='mr2' key={ind}>
                  <Tooltip title={prettyUrl(link.url)} key={link.url}>
                    <a href={link.url} target='_blank' className='gray60 hover-gray50'>
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
            <BioIcon className='inline-block flex-none gray60' />
            <div className='inline-block pl3 f-sm gray10 flex-auto'>{purpose}</div>
          </div>
        </section>
        <section>
          <InfoHeader name='Team Members' onClick={onEditTeamClick} />
          <div className='px2 py3'>
            {team.map((teamMember, ind) => <CircleAvatar {...teamMember} size={38} style={{marginLeft: '2px'}} key={ind} />)}
          </div>
        </section>
        <AddToMasterList
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={onAddCampaignToMasterLists}
          document={campaign}
          masterlists={masterLists}
          type='Campaigns' />
        <AddTags
          type='Campaigns'
          open={addTagsOpen}
          onDismiss={dismissAddTags}
          title={`Tag the ${name} Campaign`}
          selectedTags={tags}
          onUpdateTags={onUpdateTags} />
        <QuickAdd
          selectedMasterLists={masterLists}
          tags={tags}
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
