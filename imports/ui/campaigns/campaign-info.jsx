import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { LinkedTag } from '/imports/ui/tags/tag'
import EditableAvatar from '/imports/ui/images/editable-avatar'
import { SquareAvatar, CircleAvatar } from '/imports/ui/images/avatar'
import { BioIcon, FavouritesIcon, WebsiteIcon } from '/imports/ui/images/icons'
import InfoHeader from '/imports/ui/lists/info-header'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import Tooltip from '/imports/ui/navigation/tooltip'
import { updateCampaign } from '/imports/api/campaigns/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import CampaignListLink from '/imports/ui/master-lists/campaign-list-link'
import { setMasterLists } from '/imports/api/master-lists/methods'
import { GOLD, GREY60 } from '/imports/ui/colours'

const CampaignInfo = withSnackbar(React.createClass({
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

  onAddCampaignToMasterLists (masterLists) {
    setMasterLists.call({
      type: 'Campaigns',
      item: this.props.campaign._id,
      masterLists: masterLists.map(masterList => masterList._id)
    }, (error) => {
      if (error) {
        console.error(error)

        return this.props.snackbar.error('update-campaign-campaign-lists-failure')
      }

      this.props.snackbar.show(`Updated Campaign Lists`, 'update-campaign-campaign-lists-success')
    })
  },

  onAddTags () {
    this.setState({addTagsOpen: true})
  },

  dismissAddTags () {
    this.setState({addTagsOpen: false})
  },

  onUpdateTags (tags) {
    Meteor.call('Tags/set', {
      type: 'Campaigns',
      _id: this.props.campaign._id,
      tags: tags.map((t) => t.name)
    }, (error) => {
      if (error) {
        console.error(error)

        return this.props.snackbar.error('update-campaign-tags-failure')
      }

      this.props.snackbar.show(`Updated ${this.props.campaign.name} tags`, 'update-campaign-tags-success')
    })
  },

  onAvatarChange (event) {
    updateCampaign.call({
      _id: this.props.campaign._id,
      avatar: event.url,
      clientName: this.props.campaign.client ? this.props.campaign.client.name : null
    }, (error) => {
      if (error) {
        console.error('Failed to update campaign avatar', error)

        this.props.snackbar.error('campaign-avatar-update-failure')

        return
      }

      this.props.snackbar.show('Updated campaign avatar', 'campaign-avatar-update-success')
    })
  },

  onAvatarError (error) {
    console.error('Failed to change avatar', error)
    this.props.snackbar.error('campaign-avatar-update-failure')
  },

  onToggleFavourite () {
    Meteor.call('campaigns/toggle-favourite', this.props.campaign.slug, (error, state) => {
      if (error) {
        console.error('Could not toggle favourite status for campaign', error)
        this.props.snackbar.error('campaign-favourite-failure')

        return
      }

      if (state) {
        this.props.snackbar.show(`Campaign added to your favourites`, 'campaign-info-favourite-success')
      } else {
        this.props.snackbar.show(`Campaign removed from your favourites`, 'campaign-info-unfavourite-success')
      }
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
    const { addTagsOpen } = this.state
    const { onEditClick, onEditTeamClick, user, campaign } = this.props
    const { name, client, avatar, purpose, links, team, tags, masterLists } = this.props.campaign
    const isFavourite = user.myCampaigns.some((m) => m._id === campaign._id)
    const tooltip = isFavourite ? 'Remove from My Campaigns' : 'Add to My Campaigns'
    const favouriteButtonId = isFavourite ? 'remove-from-my-campaigns-button' : 'add-to-my-campaigns-button'
    return (
      <div data-id='campaign-details'>
        <div className='flex items-start mb1' data-id='campaign-info'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuLeft={0} menuTop={-20}>
            <SquareAvatar size={70} avatar={avatar} name={name} />
          </EditableAvatar>
          <div className='ml3 flex-auto'>
            <div className='semibold f-xl mb1'>
              <span data-id='campaign-name'>{name}</span>
              <Tooltip title={tooltip}>
                <FavouritesIcon data-id={favouriteButtonId} className='mx1 pointer' onClick={onToggleFavourite} style={{width: '18px', height: '18px', fill: isFavourite ? GOLD : GREY60}} />
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
          <InfoHeader name='Campaign Lists' onClick={onAddToMasterList} data-id='edit-campaign-campaign-lists-button' />
          <div className='px2 py3'>
            {masterLists.map((list, index) => (
              <span className='inline-block mr1' key={list._id}>
                <CampaignListLink campaignList={list} linkClassName='pointer blue f-sm semibold' />
                {masterLists.length > 1 && index < masterLists.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </section>
        <section>
          <InfoHeader name='Tags' onClick={onAddTags} data-id='edit-campaign-tags-button' />
          <div className='px2 py3'>
            {tags.map((t) => (<LinkedTag to={`/campaigns?tag=${t.slug}`} name={t.name} count={t.count} key={t.slug} />))}
          </div>
        </section>
        <AddToMasterListModal
          items={[this.props.campaign]}
          open={this.state.addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={(masterLists) => this.onAddCampaignToMasterLists(masterLists)}
          selectedMasterLists={masterLists}
          type='Campaigns'
          title={`Add ${name} to a Campaign List`} />
        <AddTagsModal
          type='Campaigns'
          open={addTagsOpen}
          onDismiss={dismissAddTags}
          title={`Tag the ${name} Campaign`}
          selectedTags={tags}
          onUpdateTags={onUpdateTags} />
      </div>
    )
  }
}))

function prettyUrl (url) {
  url = url.replace(/^https?:\/\//i, '')
  return url[url.length - 1] === '/' ? url.slice(0, -1) : url
}

export default CampaignInfo
