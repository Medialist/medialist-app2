import querystring from 'querystring'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import MasterLists from '/imports/api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import { Link, withRouter } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
import ContactsTable from '/imports/ui/contacts/contacts-table'
import SearchBox from '/imports/ui/lists/search-box'
import ContactsActionsToast from '/imports/ui/contacts/contacts-actions-toast'
import MasterListsSelector from '/imports/ui/campaigns/masterlists-selector'
import { CreateContactModal } from '/imports/ui/contacts/edit-contact'
import ContactListEmpty from '/imports/ui/contacts/contacts-list-empty'
import { FeedContactIcon } from '/imports/ui/images/icons'
import createSearchContainer from '/imports/ui/contacts/search-container'
import AddContactsToCampaign from '/imports/ui/contacts/add-contacts-to-campaign'
import Campaigns from '/imports/api/campaigns/campaigns'
import CountTag, { AvatarTag } from '/imports/ui/tags/tag'
import { batchFavouriteContacts } from '/imports/api/contacts/methods'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import NearBottomContainer from '/imports/ui/navigation/near-bottom-container'
import SubscriptionLimitContainer from '/imports/ui/navigation/subscription-limit-container'
import Loading from '/imports/ui/lists/loading'
import DeleteContactsModal from '/imports/ui/contacts/delete-contacts-modal'

/*
 * ContactPage and ContactsPageContainer
 *
 * The Router passes in parameters on query string.
 * The Page component is wrapped in a Meteor data container.
 * The container handles the subscription, and maps the query params to subscription filters.
 * The subscription should be stable across param changes. The router will update the page rather than destroy and re-create, as the same page is matched each time the query changes.
 * The subcription is initially the n recently updated contacts
 * The sort options are encoded as `?sort=updatedAt+asc`
 * The search term is `?q=<term>`
 * The sector-selector is ?sector=<sector>
 */

const ContactsPage = withSnackbar(React.createClass({
  getInitialState () {
    return {
      selections: [],
      isDropdownOpen: false,
      addContactModal: false,
      addContactsToCampaignModal: false,
      addTagsModal: false,
      addToMasterListsModal: false,
      deleteContactsModal: false
    }
  },

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props

    if (query && query.createContact) {
      this.setState({
        addContactModal: true
      })

      router.replace(pathname)
    }
  },

  onMasterListChange (selectedMasterListSlug) {
    this.props.setQuery({ selectedMasterListSlug })
  },

  onSortChange (sort) {
    this.props.setQuery({ sort })
  },

  onTermChange (term) {
    this.props.setQuery({ term })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onFavouriteAll () {
    const contactSlugs = this.state.selections.map((s) => s.slug)

    batchFavouriteContacts.call({contactSlugs}, (error) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('batch-favourite-contacts-failure')
      }
      this.props.snackbar.show(`Favourited ${contactSlugs.length} ${contactSlugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-favourite-contacts-success')
    })
  },

  onTagAll (tags) {
    const slugs = this.state.selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)

    batchAddTags.call({type: 'Contacts', slugs, names}, (error) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('batch-tag-contacts-failure')
      }

      this.props.snackbar.show(`Added ${names.length} ${names.length === 1 ? 'tag' : 'tags'} to ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-tag-contacts-success')
    })
  },

  onAddAllToMasterLists (masterLists) {
    const slugs = this.state.selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)

    batchAddToMasterLists.call({type: 'Contacts', slugs, masterListIds}, (error) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('contacts-batch-add-to-contact-list-failure')
      }

      this.props.snackbar.show(`Added ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'} to ${masterLists.length} ${masterLists.length === 1 ? 'Contact List' : 'Contact Lists'}`, 'batch-add-contacts-to-contact-list-success')
    })
  },

  clearSelection () {
    this.setState({
      selections: []
    })
  },

  showModal (modal) {
    this.hideModals()

    this.setState((s) => ({
      [modal]: true
    }))
  },

  onDropdownArrowClick () {
    this.setState({ isDropdownOpen: true })
  },

  onDropdownDismiss () {
    this.setState({ isDropdownOpen: false })
  },

  onLinkClick () {
    this.setState({ isDropdownOpen: false })
  },

  clearSelectionAndHideModals () {
    this.hideModals()
    this.clearSelection()
  },

  hideModals () {
    this.setState({
      addContactModal: false,
      addContactsToCampaignModal: false,
      addTagsModal: false,
      addToMasterListsModal: false,
      deleteContactsModal: false
    })
  },

  onCampaignRemove (campaign) {
    const { setQuery, campaignSlugs } = this.props
    setQuery({
      campaignSlugs: campaignSlugs.filter((str) => str !== campaign.slug)
    })
  },

  onTagRemove (tag) {
    const { setQuery, tagSlugs } = this.props
    setQuery({
      tagSlugs: tagSlugs.filter((str) => str !== tag.slug)
    })
  },

  onImportRemove () {
    const { setQuery } = this.props
    setQuery({ importId: false })
  },

  render () {
    const {
      contactsCount,
      selectedMasterListSlug,
      loading,
      searching,
      contacts,
      term,
      sort,
      campaigns,
      selectedTags,
      importId
    } = this.props

    const {
      onSortChange,
      onSelectionsChange,
      onMasterListChange,
      onTermChange,
      onCampaignRemove,
      onTagRemove,
      onImportRemove
    } = this

    const {
      selections
    } = this.state

    if (!loading && contactsCount === 0) {
      return <ContactListEmpty />
    }

    return (
      <div style={{paddingBottom: 100}}>
        <div style={{height: 58}} className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <MasterListsSelectorContainer
              type='Contacts'
              userId={this.props.userId}
              allCount={contactsCount}
              selectedMasterListSlug={selectedMasterListSlug}
              onChange={onMasterListChange} />
          </div>
          <div className='flex-none bg-white center px4' style={{width: 240}}>
            <button className='btn bg-completed white mr1' onClick={() => this.showModal('addContactModal')} data-id='new-contact-button'>New Contact</button>
            <Dropdown>
              <button className='btn bg-completed white' onClick={this.onDropdownArrowClick} data-id='contact-actions-button'>
                <Arrow direction='down' style={{ marginLeft: 0 }} />
              </button>
              <DropdownMenu width={210} left={-165} top={0} arrowAlign='right' arrowMarginRight='15px' open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
                <nav className='block py1'>
                  <Link to='/contacts/import' className='block px3 py2 f-md normal gray20 hover-bg-gray90' activeClassName='active' onClick={this.onLinkClick} data-id='import-contacts-button'>
                    <FeedContactIcon />
                    <span className='ml2'>Import Contacts</span>
                  </Link>
                </nav>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className='bg-white shadow-2 m4 mt8' data-id='contacts-table'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={onTermChange} placeholder='Search contacts...' data-id='search-contacts-input'>
                <div style={{margin: '1px 4px -4px 6px'}} >
                  {campaigns && campaigns.map((c) => (
                    <AvatarTag
                      key={c.slug}
                      name={c.name}
                      avatar={c.avatar}
                      onRemove={() => onCampaignRemove(c)}
                    />
                  ))}
                  {selectedTags && selectedTags.map((t) => (
                    <CountTag
                      key={t.slug}
                      name={t.name}
                      count={t.contactsCount}
                      onRemove={() => onTagRemove(t)}
                    />
                  ))}
                  {importId && (
                    <CountTag name='Imported Contacts' onRemove={onImportRemove} />
                  )}
                </div>
              </SearchBox>
            </div>
            <div className='flex-none pl4 f-xs'>
              <ContactsTotal searching={searching} results={contacts} total={selectedMasterListSlug ? contacts.length : contactsCount} />
            </div>
          </div>
          <ContactsTable
            contacts={contacts}
            loading={loading}
            sort={sort}
            limit={25}
            term={term}
            selections={selections}
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange}
            searching={searching} />
        </div>
        { loading && <div className='center p4'><Loading /></div> }
        <ContactsActionsToast
          contacts={this.state.selections}
          onCampaignClick={() => this.showModal('addContactsToCampaignModal')}
          onSectorClick={() => this.showModal('addToMasterListsModal')}
          onFavouriteClick={() => this.onFavouriteAll()}
          onTagClick={() => this.showModal('addTagsModal')}
          onDeleteClick={() => this.showModal('deleteContactsModal')}
          onDeselectAllClick={() => this.clearSelection()} />
        <CreateContactModal
          onDismiss={() => this.hideModals()}
          open={this.state.addContactModal} />
        <AddContactsToCampaign
          title='Add these Contacts to a Campaign'
          contacts={this.state.selections}
          onDismiss={() => this.hideModals()}
          open={this.state.addContactsToCampaignModal}>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddContactsToCampaign>
        <AddTagsModal
          type='Contacts'
          open={this.state.addTagsModal}
          onDismiss={() => this.hideModals()}
          onUpdateTags={(tags) => this.onTagAll(tags)}
          title='Tag these Contacts'>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddTagsModal>
        <AddToMasterListModal
          type='Contacts'
          items={this.state.selections}
          open={this.state.addToMasterListsModal}
          onDismiss={() => this.hideModals()}
          onSave={(masterLists) => this.onAddAllToMasterLists(masterLists)}
          title='Add to a Contact List'>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddToMasterListModal>
        <DeleteContactsModal
          open={this.state.deleteContactsModal}
          contacts={this.state.selections}
          onDelete={() => this.clearSelectionAndHideModals()}
          onDismiss={() => this.hideModals()}
        />
      </div>
    )
  }
}))

const MasterListsSelectorContainer = createContainer((props) => {
  const { selectedMasterListSlug, userId } = props
  const lists = MasterLists.find({type: 'Contacts'}).map(({slug, name, items}) => ({
    slug, name, count: items.length
  }))
  const items = [
    { slug: 'all', name: 'All', count: props.allCount },
    { slug: 'my', name: 'My Contacts', count: Meteor.user().myContacts.length }
  ].concat(lists)
  const selectedSlug = userId ? 'my' : selectedMasterListSlug
  return { ...props, items, selectedSlug }
}, MasterListsSelector)

const ContactsTotal = ({ searching, results, total }) => {
  const num = searching ? results.length : total
  const label = searching ? 'match' : 'total'
  return <div>{num} contact{num === 1 ? '' : 's'} {label}</div>
}

const SearchableContactsPage = createSearchContainer(ContactsPage)

// I decode and encode the search options from the query string
// and set up the subscriptions and collecton queries from those options.
const ContactsPageContainer = withRouter(React.createClass({
  // API is like setState...
  // Pass an obj with the new params you want to set on the query string.
  setQuery (opts) {
    const { location, router } = this.props
    const newQuery = {}

    if (opts.sort) {
      newQuery.sort = JSON.stringify(opts.sort)
    }

    if (opts.hasOwnProperty('term')) {
      newQuery.q = opts.term
    }

    if (opts.selectedMasterListSlug) {
      if (opts.selectedMasterListSlug === 'my') {
        newQuery.my = Meteor.userId()
      } else {
        newQuery.list = opts.selectedMasterListSlug
      }
    }

    if (opts.tagSlugs) {
      newQuery.tag = opts.tagSlugs
    }

    if (opts.campaignSlugs) {
      newQuery.campaign = opts.campaignSlugs
    }

    if (opts.hasOwnProperty('importId')) {
      newQuery.importId = opts.importId
    }

    const query = Object.assign({}, location.query, newQuery)
    if (query.q === '') {
      delete query.q
    }

    if (query.list === 'all' || newQuery.my) {
      delete query.list
    }

    if (newQuery.list) {
      delete query.my
    }

    if (!query.importId) {
      delete query.importId
    }

    const qs = querystring.stringify(query)

    if (!qs) {
      return router.replace('/contacts')
    }

    router.replace(`/contacts?${qs}`)
  },

  render () {
    const { location } = this.props
    return (
      <NearBottomContainer>
        {(nearBottom) => (
          <SubscriptionLimitContainer wantMore={nearBottom}>
            {(limit) => (
              <SearchableContactsPage
                limit={limit}
                {...this.props}
                {...this.data}
                {...this.props.parseQuery(location)}
                setQuery={this.setQuery} />
            )}
          </SubscriptionLimitContainer>
        )}
      </NearBottomContainer>
    )
  }
}))

export default createContainer((props) => {
  const sub = Meteor.subscribe('campaigns')

  const parseQuery = ({query}) => {
    const sort = query.sort ? JSON.parse(query.sort) : {
      updatedAt: -1
    }
    const term = query.q || ''
    const tagSlugs = query.tag ? [query.tag] : []
    const { campaign, list, my, importId } = query

    if (!campaign) {
      return {
        sort,
        term,
        selectedMasterListSlug: list,
        userId: my,
        campaignSlugs: [],
        campaigns: [],
        tagSlugs,
        importId,
        loading: sub.ready()
      }
    }

    const campaignSlugs = Array.isArray(campaign) ? campaign : [campaign]
    const campaigns = Campaigns.find({
      slug: {
        $in: campaignSlugs
      }
    }).fetch()

    return {
      sort,
      term,
      list,
      selectedMasterListSlug: list,
      userId: my,
      campaignSlugs,
      campaigns,
      tagSlugs,
      loading: sub.ready()
    }
  }

  return { ...props, parseQuery, loading: sub.ready() }
}, ContactsPageContainer)
