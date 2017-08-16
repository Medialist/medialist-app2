import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from '/imports/ui/contacts/contact-topbar'
import StatusStats from '/imports/ui/contacts/status-stats'
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
import NearBottomContainer from '/imports/ui/navigation/near-bottom-container'
import SubscriptionLimitContainer from '/imports/ui/navigation/subscription-limit-container'
import { LoadingBar } from '/imports/ui/lists/loading'
import querystring from 'querystring'
import { StatusIndex } from '/imports/api/contacts/status'
import escapeRegExp from 'lodash.escaperegexp'
import { ContactCampaigns, ContactCampaignStatuses } from '/imports/ui/contacts/collections'
import SearchBox from '/imports/ui/lists/search-box'
import CampaignsTable from '/imports/ui/campaigns/campaigns-table'
import CountTag from '/imports/ui/tags/tag'

const minSearchLength = 3

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
    loading: PropTypes.bool.isRequired,
    contact: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
    campaignsTotal: PropTypes.number.isRequired,
    sort: PropTypes.object.isRequired,
    term: PropTypes.string,
    selectedTags: PropTypes.array.isRequired,
    setQuery: PropTypes.func.isRequired,
    status: PropTypes.string,
    statusCounts: PropTypes.object
  }

  state = {
    selections: [],
    addToCampaignModal: false,
    addTagsToCampaignsModal: false,
    addToCampaignListsModal: false,
    removeContactFromCampaignsModal: false
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

  onSortChange = (sort) => {
    this.props.setQuery({ sort })
  }

  onTermChange = (term) => {
    this.props.setQuery({ term })
  }

  onStatusFilterChange = (status) => {
    this.props.setQuery({ status })
  }

  render () {
    const {
      loading,
      contact,
      campaigns,
      campaignsTotal,
      sort,
      term,
      selectedTags,
      status,
      statusCounts
    } = this.props
    const {
      onSelectionsChange,
      onTagRemove,
      onSortChange,
      onTermChange,
      onStatusFilterChange
    } = this
    const {
      selections
    } = this.state

    if (!contact || loading) {
      return <LoadingBar />
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
          <StatusStats className='flex-none' statuses={statusCounts} active={status} onStatusClick={onStatusFilterChange} />
        </div>
        <div className='bg-white shadow-2 m4' data-id='campaigns-table'>
          <div className='pt4 pl4 pr4 pb1 items-center'>
            <SearchBox initialTerm={term} onTermChange={onTermChange} placeholder='Search campaigns...' data-id='search-campaigns-input' style={{zIndex: 1}}>
              {selectedTags && selectedTags.map((t) => (
                <CountTag
                  style={{marginBottom: 0}}
                  key={t.slug}
                  name={t.name}
                  count={t.contactsCount}
                  onRemove={() => onTagRemove(t)}
                />
              ))}
            </SearchBox>
            <div className='f-xs gray60' style={{position: 'relative', top: -35, right: 20, textAlign: 'right', zIndex: 0}}>{campaignsTotal} campaign{campaignsTotal === 1 ? '' : 's'}</div>
          </div>
          <CampaignsTable
            term={term}
            sort={sort}
            campaigns={campaigns}
            selections={selections}
            contact={contact}
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange}
            searching={Boolean(term)} />
        </div>
        { loading && <LoadingBar /> }
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
          onUpdateTags={this.onTagAll}>
          <AbbreviatedAvatarList items={this.state.selections} shape='square' />
        </AddTagsModal>
        <AddToMasterListModal
          type='Campaigns'
          items={this.state.selections}
          open={this.state.addToCampaignListsModal}
          onDismiss={this.hideModals}
          onSave={this.onAddAllToMasterLists}>
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

// I decode and encode the search options from the query string
// and set up the subscriptions and collecton queries from those options.
const ContactCampaignsPageContainer = (props, context) => {
  if (props.loading) {
    return <LoadingBar />
  }

  // API is like setState...
  // Pass an obj with the new params you want to set on the query string.
  // has to be in a container because createComponent does not give you access to context
  const setQuery = (opts) => {
    const { location } = props
    const { router } = context
    const newQuery = {}

    if (opts.sort) {
      try {
        newQuery.sort = JSON.stringify(opts.sort)
      } catch (error) {
        console.warn(error)
      }
    }

    if (opts.hasOwnProperty('term')) {
      newQuery.q = opts.term
    }

    if (opts.hasOwnProperty('status')) {
      newQuery.status = opts.status
    }

    const query = Object.assign({}, location.query, newQuery)

    if (query.q === '') {
      delete query.q
    }

    if (opts.status === null) {
      delete query.status
    }

    const qs = querystring.stringify(query)

    if (!qs) {
      return router.replace(`/contact/${props.contact.slug}/campaigns`)
    }

    router.replace(`/contact/${props.contact.slug}/campaigns?${qs}`)
  }

  return (
    <NearBottomContainer>
      {(nearBottom) => (
        <SubscriptionLimitContainer wantMore={nearBottom}>
          {(limit) => (
            <ContactCampaignsPage
              limit={limit}
              {...props}
              setQuery={setQuery} />
          )}
        </SubscriptionLimitContainer>
      )}
    </NearBottomContainer>
  )
}
ContactCampaignsPageContainer.contextTypes = {
  router: PropTypes.object
}

const parseQuery = ({ query }) => {
  let sort = {
    updatedAt: -1
  }

  if (query.sort) {
    try {
      sort = JSON.parse(query.sort)
    } catch (error) {
      console.warn(error)
    }
  }

  const term = (query.q || '').trim()
  const status = (query.status || '').trim()

  return {
    sort,
    term,
    status
  }
}

export default createContainer(({location, params: { contactSlug }}) => {
  const subs = [
    Meteor.subscribe('contact-page', contactSlug),
    Meteor.subscribe('contact-campaigns', contactSlug),
    Meteor.subscribe('contact-campaign-statuses', contactSlug)
  ]
  const loading = subs.some((s) => !s.ready())

  if (loading) {
    return {
      loading: true
    }
  }

  const {
    sort,
    term,
    status
  } = parseQuery(location)

  const query = {
    contact: contactSlug
  }

  if (status && StatusIndex[status] > -1) {
    query.status = status
  }

  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(escapeRegExp(term), 'gi')

    query.$or = [{
      name: termRegExp
    }, {
      clientName: termRegExp
    }, {
      purpose: termRegExp
    }]
  }

  const cursor = ContactCampaigns.find(query, {
    sort
  })
  const campaigns = cursor.fetch()
  const campaignsCount = cursor.count()
  const statusCounts = ContactCampaignStatuses.findOne({
    contact: contactSlug
  })
  const contact = Contacts.findOne({
    slug: contactSlug
  })
  const selectedTags = []

  return {
    loading,
    contact,
    campaigns,
    campaignsTotal: campaignsCount,
    sort,
    term,
    selectedTags,
    status,
    statusCounts
  }
}, ContactCampaignsPageContainer)
