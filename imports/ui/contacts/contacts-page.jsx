import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { Meteor } from 'meteor/meteor'
import MasterLists from '/imports/api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import { Link, withRouter } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import fileDownload from 'react-file-download'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
import ContactsTable from '/imports/ui/contacts/contacts-table'
import SearchBox, { SearchBoxCount } from '/imports/ui/lists/search-box'
import ContactsActionsToast from '/imports/ui/contacts/contacts-actions-toast'
import MasterListsSelector from '/imports/ui/campaigns/masterlists-selector'
import { CreateContactModal } from '/imports/ui/contacts/edit-contact'
import ContactListEmpty from '/imports/ui/contacts/contacts-list-empty'
import { FeedContactIcon } from '/imports/ui/images/icons'
import createSearchContainer, { createSearchCountContainer } from '/imports/ui/contacts/search-container'
import AddContactsToCampaign from '/imports/ui/contacts/add-to-campaign/add-many-modal'
import CountTag, { AvatarTag } from '/imports/ui/tags/tag'
import { batchFavouriteContacts, batchRemoveContacts, exportContactsToCsv } from '/imports/api/contacts/methods'
import { batchAddTagsToContacts } from '/imports/api/tags/methods'
import { batchAddToContactLists } from '/imports/api/master-lists/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import createLimitContainer from '/imports/ui/navigation/increase-limit-on-scroll-container'
import {LoadingBar} from '/imports/ui/lists/loading'
import DeleteContactsModal from '/imports/ui/contacts/delete-contacts-modal'
import { addRecentContactList } from '/imports/api/users/methods'
import createSearchQueryContainer from './search-query-container'
import createSearchEnricher from './search-enricher'
import { ContactSearchSchema } from '/imports/api/contacts/schema'

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

class ContactsPage extends React.Component {
  static propTypes = {
    allContactsCount: PropTypes.number.isRequired,
    contactsCount: PropTypes.number.isRequired,
    contacts: PropTypes.array.isRequired,
    masterListSlug: PropTypes.string,
    loading: PropTypes.bool,
    searching: PropTypes.bool,
    searchTermActive: PropTypes.bool,
    term: PropTypes.string,
    sort: PropTypes.object,
    campaigns: PropTypes.array,
    selectedTags: PropTypes.array,
    importId: PropTypes.string,
    onChangeTerm: PropTypes.func,
    onChangeSort: PropTypes.func,
    onChangeMasterListSlug: PropTypes.func,
    onChangeUserId: PropTypes.func,
    onChangeImportId: PropTypes.func,
    onChangeTagSlugs: PropTypes.func,
    onChangeCampaignSlugs: PropTypes.func,
    onChangeUrlQueryParams: PropTypes.func
  }

  state = {
    selectionMode: 'include',
    selections: [],
    isDropdownOpen: false,
    addContactModal: false,
    addContactsToCampaignModal: false,
    addTagsModal: false,
    addToMasterListsModal: false,
    deleteContactsModal: false
  }

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props

    if (query && query.createContact) {
      this.setState({
        addContactModal: true
      })

      router.replace(pathname)
    }
  }

  onMasterListChange = (masterListSlug) => {
    if (masterListSlug === 'all') {
      this.props.onChangeUrlQueryParams({
        masterListSlug: null,
        userId: null
      })
    } else if (masterListSlug === 'my') {
      this.props.onChangeUrlQueryParams({
        masterListSlug: null,
        userId: Meteor.userId()
      })
    } else {
      this.props.onChangeUrlQueryParams({
        masterListSlug,
        userId: null
      })
      addRecentContactList.call({ slug: masterListSlug })
    }
    this.clearSelection()
  }

  onSelectionsChange = (selections) => {
    this.setState({ selections })
  }

  onFavouriteAll = () => {
    const opts = this.getSearchOrSlugs()
    batchFavouriteContacts.call(opts, (error, res) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('batch-favourite-contacts-failure')
      }
      const {slugCount} = res
      const {snackbar} = this.props
      snackbar.show(`Favourited ${slugCount} ${slugCount === 1 ? 'contact' : 'contacts'}`, 'batch-favourite-contacts-success')
    })
  }

  onTagAll = (tags) => {
    const opts = this.getSearchOrSlugs()
    opts.names = tags.map((t) => t.name)
    batchAddTagsToContacts.call(opts, (error, res) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('batch-tag-contacts-failure')
      }
      const {snackbar} = this.props
      const {slugCount, tagCount} = res
      snackbar.show(`Added ${tagCount} ${tagCount === 1 ? 'tag' : 'tags'} to ${slugCount} ${slugCount === 1 ? 'contact' : 'contacts'}`, 'batch-tag-contacts-success')
    })
  }

  onAddAllToMasterLists = (masterLists) => {
    const opts = this.getSearchOrSlugs()
    opts.masterListIds = masterLists.map((m) => m._id)
    batchAddToContactLists.call(opts, (error, res) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('contacts-batch-add-to-contact-list-failure')
      }
      const {snackbar} = this.props
      const {slugCount, masterListCount} = res
      snackbar.show(`Added ${slugCount} ${slugCount === 1 ? 'contact' : 'contacts'} to ${masterListCount} ${masterListCount === 1 ? 'Contact List' : 'Contact Lists'}`, 'batch-add-contacts-to-contact-list-success')
    })
  }

  onDelete = () => {
    const opts = this.getSearchOrSlugs()
    batchRemoveContacts.call(opts, (error, res) => {
      if (error) {
        console.log(error)
        this.props.snackbar.error('batch-delete-contacts-failure')
      } else {
        const {snackbar} = this.props
        const {slugCount} = res
        const name = slugCount > 1 ? `${slugCount} Contacts` : this.state.selections[0].name
        snackbar.show(`Deleted ${name}`, 'batch-delete-contacts-success')
        this.clearSelectionAndHideModals()
      }
    })
  }

  onExportToCsv = () => {
    const opts = this.getSearchOrSlugs()
    exportContactsToCsv.call(opts, (error, res) => {
      if (error) {
        console.log(error)
        this.props.snackbar.error('export-contacts-to-csv-failure')
      } else {
        fileDownload(res.data, res.filename, 'text/csv')
        this.clearSelectionAndHideModals()
      }
    })
  }

  onTermChange = (term) => {
    this.props.onChangeTerm(term)
    this.clearSelection()
  }

  onSortChange = (sort) => {
    this.props.onChangeSort(sort)
    this.clearSelection()
  }

  onSelectionModeChange = (selectionMode) => {
    this.setState({selectionMode})
  }

  clearSelection = () => {
    this.setState({
      selections: [],
      selectionMode: 'include'
    })
  }

  showModal = (modal) => {
    this.hideModals()

    this.setState((s) => ({
      [modal]: true
    }))
  }

  onDropdownArrowClick = () => {
    this.setState({ isDropdownOpen: true })
  }

  onDropdownDismiss = () => {
    this.setState({ isDropdownOpen: false })
  }

  onLinkClick = () => {
    this.setState({ isDropdownOpen: false })
  }

  clearSelectionAndHideModals = () => {
    this.hideModals()
    this.clearSelection()
  }

  hideModals = () => {
    this.setState({
      addContactModal: false,
      addContactsToCampaignModal: false,
      addTagsModal: false,
      addToMasterListsModal: false,
      deleteContactsModal: false
    })
  }

  onCampaignRemove = (campaign) => {
    const { onChangeCampaignSlugs, campaignSlugs } = this.props
    onChangeCampaignSlugs(campaignSlugs.filter((str) => str !== campaign.slug))
    this.clearSelection()
  }

  onTagRemove = (tag) => {
    const { onChangeTagSlugs, tagSlugs } = this.props
    onChangeTagSlugs(tagSlugs.filter((str) => str !== tag.slug))
    this.clearSelection()
  }

  onImportRemove = () => {
    this.props.onChangeImportId(null)
    this.clearSelection()
  }

  onContactCreated = (contactSlug) => {
    this.hideModals()
    this.props.router.push(`/contact/${contactSlug}`)
  }

  getSearchOrSlugs = () => {
    const {selectionMode} = this.state
    if (selectionMode === 'all') {
      const contactSearch = this.extractContactSearch(this.props)
      return { contactSearch }
    } else {
      const contactSlugs = this.state.selections.map((s) => s.slug)
      return { contactSlugs }
    }
  }

  extractContactSearch (props) {
    return ContactSearchSchema.clean({...props})
  }

  render () {
    const {
      allContactsCount,
      contactsCount,
      masterListSlug,
      loading,
      searchTermActive,
      contacts,
      term,
      sort,
      campaigns,
      selectedTags,
      importId
    } = this.props

    const {
      onSelectionsChange,
      onMasterListChange,
      onCampaignRemove,
      onTagRemove,
      onImportRemove
    } = this

    const {
      selections,
      selectionMode
    } = this.state

    if (!loading && allContactsCount === 0) {
      return <ContactListEmpty />
    }

    const contactSearch = this.extractContactSearch(this.props)
    const selectionsLength = selectionMode === 'all' ? contactsCount : selections.length

    return (
      <div style={{paddingBottom: 100}}>
        <div style={{height: 58}} className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <MasterListsSelectorContainer
              type='Contacts'
              userId={this.props.userId}
              allCount={allContactsCount}
              selectedMasterListSlug={masterListSlug}
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
          <div className='pt4 pl4 pr4 pb1 items-center'>
            <SearchBox initialTerm={term} onTermChange={this.onTermChange} placeholder='Search contacts...' data-id='search-contacts-input' style={{zIndex: 1}}>
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
            <SearchBoxCount type='contact' loading={loading} total={contactsCount} />
          </div>
          <ContactsTable
            contacts={contacts}
            loading={loading}
            sort={sort}
            limit={25}
            term={term}
            selections={selections}
            selectionMode={selectionMode}
            onSelectionModeChange={this.onSelectionModeChange}
            onSortChange={this.onSortChange}
            onSelectionsChange={onSelectionsChange}
            searchTermActive={searchTermActive} />
        </div>
        { loading && <LoadingBar /> }
        <ContactsActionsToast
          contacts={selections}
          contactsCount={selectionsLength}
          onCampaignClick={() => this.showModal('addContactsToCampaignModal')}
          onSectorClick={() => this.showModal('addToMasterListsModal')}
          onFavouriteClick={() => this.onFavouriteAll()}
          onTagClick={() => this.showModal('addTagsModal')}
          onDeleteClick={() => this.showModal('deleteContactsModal')}
          onDeselectAllClick={() => this.clearSelection()}
          onExportToCsvClick={this.onExportToCsv} />
        <CreateContactModal
          onContactCreated={this.onContactCreated}
          onDismiss={this.hideModals}
          open={this.state.addContactModal} />
        <AddContactsToCampaign
          title='Add these Contacts to a Campaign'
          contacts={selections}
          contactsCount={selectionsLength}
          contactSearch={contactSearch}
          selectionMode={selectionMode}
          onDismiss={this.hideModals}
          open={this.state.addContactsToCampaignModal} />
        <AddTagsModal
          type='Contacts'
          open={this.state.addTagsModal}
          onDismiss={this.hideModals}
          onUpdateTags={this.onTagAll}>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} total={selectionsLength} />
        </AddTagsModal>
        <AddToMasterListModal
          type='Contacts'
          title='Add these contacts to a list'
          items={this.state.selections}
          open={this.state.addToMasterListsModal}
          onDismiss={this.hideModals}
          onSave={this.onAddAllToMasterLists}>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} total={selectionsLength} />
        </AddToMasterListModal>
        <DeleteContactsModal
          open={this.state.deleteContactsModal}
          contacts={this.state.selections}
          contactsCount={selectionsLength}
          onDelete={this.onDelete}
          onDismiss={this.hideModals} />
      </div>
    )
  }
}

const MasterListsSelectorContainer = createContainer((props) => {
  const { selectedMasterListSlug, userId } = props

  const user = Meteor.user()

  const lists = MasterLists
    .find({
      type: 'Contacts'
    }, {
      sort: { name: 1 }
    }).map(({slug, name, items}) => ({
      slug, name, count: items.length
    }))

  const items = [{
    slug: 'all',
    name: 'All',
    count: props.allCount
  }, {
    slug: 'my',
    name: 'My Contacts',
    count: user.myContacts.length
  }]
    .concat(lists)

  const selectedSlug = userId ? 'my' : selectedMasterListSlug

  return { ...props, items, selectedSlug }
}, MasterListsSelector)

export default compose(
  createSearchQueryContainer,
  createSearchEnricher,
  createLimitContainer,
  createSearchContainer,
  createSearchCountContainer,
  withSnackbar,
  withRouter
)(ContactsPage)
