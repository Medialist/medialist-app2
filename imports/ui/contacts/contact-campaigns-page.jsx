import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from '/imports/ui/contacts/contact-topbar'
import CampaignSearch from '/imports/ui/campaigns/campaign-search'
import StatusStats from '/imports/ui/contacts/status-stats'
import campaignSearchQueryContainer from '/imports/ui/campaigns/campaign-search-query-container'
import { CircleAvatar } from '/imports/ui/images/avatar'
import EditableAvatar from '/imports/ui/images/editable-avatar'
import Contacts from '/imports/api/contacts/contacts'
import AddContactsToCampaigns from '/imports/ui/contacts/add-contacts-to-campaign'
import { updateContact } from '/imports/api/contacts/methods'
import ContactCampaignsActionsToast from '/imports/ui/contacts/contact-campaigns-actions-toast'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchFavouriteCampaigns } from '/imports/api/campaigns/methods'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import CampaignLink from '/imports/ui/campaigns/campaign-link'
import CampaignListLink from '/imports/ui/master-lists/campaign-list-link'
import TagLink from '/imports/ui/campaigns/tag-link'
import RemoveContactModal from '/imports/ui/campaigns/remove-contact'

class ContactCampaignsPage extends React.Component {
  static contextTypes = {
    snackbar: PropTypes.shape({
      show: PropTypes.func.isRequired,
      error: PropTypes.func.isRequired
    }),
    router: PropTypes.shape({
      push: PropTypes.func.isRequired
    })
  }

  static propTypes = {
    contact: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    selectedTags: PropTypes.array.isRequired,
    onTermChange: PropTypes.func.isRequired,
    onSortChange: PropTypes.func.isRequired
  }

  state = {
    selections: [],
    statusFilter: false,
    addToCampaignModal: false,
    addTagsToCampaignsModal: false,
    addToCampaignListsModal: false,
    removeContactFromCampaignsModal: false,
    sort: { updatedAt: -1 },
    term: ''
  }

  onAvatarChange = (e) => {
    const { _id } = this.props.contact

    updateContact.call({
      _id,
      avatar: e.url
    }, (error) => {
      if (error) {
        console.error('Failed to update contact avatar', error)
        this.context.snackbar.show('There was a problem updating the image.')
      }
    })
  }

  onAvatarError = (error) => {
    console.error('Failed to change contact avatar', error)

    this.context.snackbar.error('There was a problem updating the image.')
  }

  onSelectionsChange = (selections) => {
    this.setState({ selections })
  }

  clearSelectionAndHideModals = () => {
    this.hideModals()
    this.clearSelection()
  }

  clearSelection = () => {
    this.setState({
      selections: []
    })
  }

  showModal = (modal) => {
    this.hideModals()

    this.setState((s) => ({
      [modal]: true
    }))
  }

  hideModals = () => {
    this.setState({
      addToCampaignModal: false,
      addTagsToCampaignsModal: false,
      addToCampaignListsModal: false,
      removeContactFromCampaignsModal: false
    })
  }

  onViewSelection = () => {
    this.context.router.push({
      pathname: '/contacts',
      query: {
        campaign: this.state.selections.map((s) => s.slug)
      }
    })
  }

  onTagAll = (tags) => {
    const slugs = this.state.selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)

    batchAddTags.call({type: 'Campaigns', slugs, names}, (error) => {
      if (error) {
        console.log(error)
        return this.context.snackbar.error('campaigns-batch-tag-error')
      }

      const name = slugs.length > 1 ? `${slugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const tag = names.length > 1 ? `${names.length} tags` : <TagLink tag={names[0]} type='campaign' linkClassName='semibold white underline' />

      this.context.snackbar.show(<span>Added {tag} to {name}</span>, 'campaigns-batch-tag-success')
    })
  }

  onFavouriteAll = () => {
    const campaignSlugs = this.state.selections.map((c) => c.slug)

    batchFavouriteCampaigns.call({campaignSlugs}, (error) => {
      if (error) {
        console.log(error)
        return this.context.snackbar.error('campaigns-batch-favourite-error')
      }

      const name = campaignSlugs.length > 1 ? `${campaignSlugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />

      this.context.snackbar.show(<span>Favourited {name}</span>, 'campaigns-batch-favourite-success')
    })
  }

  onAddAllToMasterLists = (masterLists) => {
    const slugs = this.state.selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)

    batchAddToMasterLists.call({type: 'Campaigns', slugs, masterListIds}, (error) => {
      if (error) {
        console.log(error)
        return this.context.snackbar.error('campaigns-batch-add-to-campaign-list-failure')
      }

      const name = slugs.length > 1 ? `${slugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const list = masterLists.length > 1 ? `${masterLists.length} Campaign Lists` : <CampaignListLink campaignList={masterLists[0]} linkClassName='semibold white underline' />

      this.context.snackbar.show(<span>Added {name} to {list}</span>, 'campaigns-batch-add-to-campaign-list-success')
    })
  }

  onTagRemove = (tag) => {
    const { setQuery, tagSlugs } = this.props
    setQuery({
      tagSlugs: tagSlugs.filter((str) => str !== tag.slug)
    })
  }

  render () {
    const {contact} = this.props

    if (!contact) {
      return null
    }

    let { campaigns } = this.props
    const { loading, sort, term, selectedTags, onTermChange, onSortChange } = this.props
    const { onSelectionsChange, onTagRemove } = this
    const { selections, statusFilter } = this.state
    const statuses = campaigns.map((c) => c.contacts[contact.slug])

    if (statusFilter) {
      campaigns = campaigns.filter((c) => c.contacts[contact.slug] === statusFilter)
    }

    return (
      <div>
        <ContactTopbar contact={contact} onAddToCampaignClick={() => this.showModal('addToCampaignModal')} />
        <div className='flex items-center pt4 pb2 pr2 pl6'>
          <div className='flex-auto'>
            <div className='flex items-center'>
              <EditableAvatar avatar={this.props.contact.avatar} onChange={this.onAvatarChange} onError={this.onAvatarError} menuLeft={0} menuTop={-20}>
                <CircleAvatar className='flex-none' size={40} avatar={this.props.contact.avatar} name={this.props.contact.name} />
              </EditableAvatar>
              <div className='flex-auto ml3' style={{lineHeight: 1.4}}>
                <div className='f-xl semibold gray10 truncate'>{this.props.contact.name}</div>
                <div className='f-sm normal gray10 truncate'>
                  {this.props.contact.outlets[0] && this.props.contact.outlets[0].value} — {this.props.contact.outlets.map((o) => o.label).join(', ')}
                </div>
              </div>
            </div>
          </div>
          <StatusStats className='flex-none' statuses={statuses} active={statusFilter} onStatusClick={(status) => this.setState({statusFilter: status})} />
        </div>
        <CampaignSearch {...{
          onTermChange,
          selectedTags,
          onTagRemove,
          total: this.props.campaigns.length,
          term,
          sort,
          campaigns,
          selections,
          onSortChange,
          onSelectionsChange,
          loading
        }} />
        <ContactCampaignsActionsToast
          campaigns={this.state.selections}
          onViewClick={this.onViewSelection}
          onSectorClick={() => this.showModal('addToCampaignListsModal')}
          onFavouriteClick={this.onFavouriteAll}
          onTagClick={() => this.showModal('addTagsToCampaignsModal')}
          onDeleteClick={() => this.showModal('removeContactFromCampaignsModal')}
          onDeselectAllClick={this.clearSelection} />
        <AddContactsToCampaigns
          title={`Add ${contact.name.split(' ')[0]} to a Campaign`}
          onDismiss={this.hideModals}
          open={this.state.addToCampaignModal}
          contacts={[contact]}
        />
        <AddTagsModal
          type='Campaigns'
          open={this.state.addTagsToCampaignsModal}
          onDismiss={this.hideModals}
          onUpdateTags={this.onTagAll}
          title='Tag these Campaigns'>
          <AbbreviatedAvatarList items={this.state.selections} shape='square' />
        </AddTagsModal>
        <AddToMasterListModal
          type='Campaigns'
          items={this.state.selections}
          open={this.state.addToCampaignListsModal}
          onDismiss={this.hideModals}
          onSave={this.onAddAllToMasterLists}
          title='Add to a Campaign List'>
          <AbbreviatedAvatarList
            items={this.state.selections}
            maxTooltip={12} shape='square' />
        </AddToMasterListModal>
        <RemoveContactModal
          open={this.state.removeContactFromCampaignsModal}
          contacts={[this.props.contact]}
          campaigns={this.state.selections}
          avatars={this.state.selections}
          onDelete={this.clearSelectionAndHideModals}
          onDismiss={this.hideModals}
        />
      </div>
    )
  }
}

export default createContainer(({params: { contactSlug }}) => {
  Meteor.subscribe('contact-page', contactSlug)
  const contact = Contacts.findOne({ slug: contactSlug })
  return { contact, contactSlug }
}, campaignSearchQueryContainer(ContactCampaignsPage))
