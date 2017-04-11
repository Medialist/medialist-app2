import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { Meteor } from 'meteor/meteor'
import CountTag from '../tags/tag.jsx'
import EditableAvatar from '../images/editable-avatar'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon, FavouritesIcon, FavouritesIconGold, WebsiteIcon } from '../images/icons'
import InfoHeader from '../lists/info-header'
import AddToMasterList from '../master-lists/add-to-master-list.jsx'
import AddTags from '../tags/add-tags'
import Tooltip from '../navigation/tooltip'
import { update } from '../../api/campaigns/methods'

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
    Meteor.call('campaigns/toggle-favourite', this.props.campaign.slug, (err) => {
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
    const isFavourite = user.myCampaigns.some((m) => m._id === campaign._id)
    const Icon = isFavourite ? FavouritesIconGold : FavouritesIcon
    const tooltip = isFavourite ? 'Remove from My Campaigns' : 'Add to My Campaigns'
    return (
      <div data-id='campaign-details'>
        <div className='flex items-start mb1' data-id='campaign-info'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuLeft={0} menuTop={-20}>
            <SquareAvatar size={70} avatar={avatar} name={name} />
          </EditableAvatar>
          <div className='ml3 flex-auto'>
            <div className='semibold block f-xl mb1' style={{ marginTop: '-3px' }}>
              <span data-id='campaign-name'>{name}</span>
              <Tooltip title={tooltip}>
                <Icon className='mx1 pointer svg-icon-lg align-bottom' onClick={onToggleFavourite} />
              </Tooltip>
            </div>
            <div className='f-sm gray10 mb2' data-id='campaign-client'>{client && client.name}</div>
            <div>
              {(links || []).map((link, index) => (
                <span className='mr2' key={index}>
                  <Tooltip title={prettyUrl(link.url)} key={link.url}>
                    <a href={link.url} target='_blank' className='gray60 hover-gray50' data-id={`campaign-link-${index}`}>
                      <WebsiteIcon className='svg-icon-md' />
                    </a>
                  </Tooltip>
                </span>
              ))}
            </div>
          </div>
        </div>
        <section data-id='campaign-key-message'>
          <InfoHeader name='Key Message' linkText='Edit' onClick={onEditClick} data-id='edit-campaign-info-button' />
          <div className='px2 py3 flex'>
            <BioIcon className='inline-block flex-none gray60' />
            <div className='inline-block pl3 f-sm gray10 flex-auto' data-id='campaign-key-message'>{purpose}</div>
          </div>
        </section>
        <section data-id='campaign-team-members'>
          <InfoHeader name='Team Members' onClick={onEditTeamClick} data-id='edit-campaign-team-members-button' />
          <div className='px2 py3'>
            {team.map((teamMember, ind) => <CircleAvatar {...teamMember} size={38} style={{marginLeft: '2px'}} key={ind} />)}
          </div>
        </section>
        <section>
          <InfoHeader name='Master Lists' onClick={onAddToMasterList} data-id='edit-campaign-master-lists-button' />
          <div className='py3'>
            {masterLists.map((m) => (
              <Link to={`/campaigns?list=${m.slug}`} className='pointer p2 blue f-sm' key={m._id}>
                {m.name}
              </Link>
            ))}
          </div>
        </section>
        <section>
          <InfoHeader name='Tags' onClick={onAddTags} data-id='edit-campaign-tags-button' />
          <div className='px2 py3'>
            {tags.map((t) => {
              return (
                <Link to={`/campaigns?tag=${t.slug}`} key={t.slug}>
                  <CountTag name={t.name} count={t.count} />
                </Link>
              )
            })}
          </div>
        </section>
        <AddToMasterList
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={onAddCampaignToMasterLists}
          document={campaign}
          masterlists={masterLists}
          type='Campaigns'
          title={`Add ${name} to a Master List`} />
        <AddTags
          type='Campaigns'
          open={addTagsOpen}
          onDismiss={dismissAddTags}
          title={`Tag the ${name} Campaign`}
          selectedTags={tags}
          onUpdateTags={onUpdateTags} />
      </div>
    )
  }
})

function prettyUrl (url) {
  url = url.replace(/^https?:\/\//i, '')
  return url[url.length - 1] === '/' ? url.slice(0, -1) : url
}

export default CampaignInfo
