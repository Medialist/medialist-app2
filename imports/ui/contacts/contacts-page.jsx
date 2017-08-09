import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { Meteor } from 'meteor/meteor'
import MasterLists from '/imports/api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import { Link } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
import ContactsTable from '/imports/ui/contacts/contacts-table'
import SearchBox from '/imports/ui/lists/search-box'
import ContactsActionsToast from '/imports/ui/contacts/contacts-actions-toast'
import MasterListsSelector from '/imports/ui/campaigns/masterlists-selector'
import { CreateContactModal } from '/imports/ui/contacts/edit-contact'
import ContactListEmpty from '/imports/ui/contacts/contacts-list-empty'
import { FeedContactIcon } from '/imports/ui/images/icons'
import createSearchContainer, { createSearchCountContainer } from '/imports/ui/contacts/search-container'
import AddContactsToCampaign from '/imports/ui/contacts/add-to-campaign/add-many-modal'
import CountTag, { AvatarTag } from '/imports/ui/tags/tag'
import { batchFavouriteContacts } from '/imports/api/contacts/methods'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import createLimitContainer from '/imports/ui/navigation/increase-limit-on-scroll-container'
import Loading from '/imports/ui/lists/loading'
import DeleteContactsModal from '/imports/ui/contacts/delete-contacts-modal'
import { addRecentContactList } from '/imports/api/users/methods'
import createSearchQueryContainer from './search-query-container'
import createSearchEnricher from './search-enricher'

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
  }

  onSelectionsChange = (selections) => {
    this.setState({ selections })
  }

  onFavouriteAll = () => {
    const contactSlugs = this.state.selections.map((s) => s.slug)

    batchFavouriteContacts.call({contactSlugs}, (error) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('batch-favourite-contacts-failure')
      }
      this.props.snackbar.show(`Favourited ${contactSlugs.length} ${contactSlugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-favourite-contacts-success')
    })
  }

  onTagAll = (tags) => {
    const slugs = this.state.selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)

    batchAddTags.call({type: 'Contacts', slugs, names}, (error) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('batch-tag-contacts-failure')
      }

      this.props.snackbar.show(`Added ${names.length} ${names.length === 1 ? 'tag' : 'tags'} to ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-tag-contacts-success')
    })
  }

  onAddAllToMasterLists = (masterLists) => {
    const slugs = this.state.selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)

    batchAddToMasterLists.call({type: 'Contacts', slugs, masterListIds}, (error) => {
      if (error) {
        console.error(error)
        return this.props.snackbar.error('contacts-batch-add-to-contact-list-failure')
      }

      this.props.snackbar.show(`Added ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'} to ${masterLists.length} ${masterLists.length === 1 ? 'Contact List' : 'Contact Lists'}`, 'batch-add-contacts-to-contact-list-success')
    })
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
  }

  onTagRemove = (tag) => {
    const { onChangeTagSlugs, tagSlugs } = this.props
    onChangeTagSlugs(tagSlugs.filter((str) => str !== tag.slug))
  }

  onImportRemove = () => {
    this.props.onChangeImportId(null)
  }

  render () {
    const {
      allContactsCount,
      contactsCount,
      masterListSlug,
      loading,
      searching,
      contacts,
      term,
      sort,
      campaigns,
      selectedTags,
      importId,
      onChangeTerm,
      onChangeSort
    } = this.props

    const {
      onSelectionsChange,
      onMasterListChange,
      onCampaignRemove,
      onTagRemove,
      onImportRemove
    } = this

    const {
      selections
    } = this.state

    if (!loading && !searching && contactsCount === 0) {
      return <ContactListEmpty />
    }

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
            <SearchBox initialTerm={term} onTermChange={onChangeTerm} placeholder='Search contacts...' data-id='search-contacts-input' style={{zIndex: 1}}>
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
            <ContactsTotal loading={loading} total={contactsCount} />
          </div>
          <ContactsTable
            contacts={contacts}
            loading={loading}
            sort={sort}
            limit={25}
            term={term}
            selections={selections}
            onSortChange={onChangeSort}
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
          open={this.state.addContactsToCampaignModal} />
        <AddTagsModal
          type='Contacts'
          open={this.state.addTagsModal}
          onDismiss={() => this.hideModals()}
          onUpdateTags={(tags) => this.onTagAll(tags)}>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddTagsModal>
        <AddToMasterListModal
          type='Contacts'
          items={this.state.selections}
          open={this.state.addToMasterListsModal}
          onDismiss={() => this.hideModals()}
          onSave={(masterLists) => this.onAddAllToMasterLists(masterLists)}>
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
}

const MasterListsSelectorContainer = createContainer((props) => {
  const { selectedMasterListSlug, userId } = props
  const user = Meteor.user()
  const lists = MasterLists
    .find({
      type: 'Contacts'
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
    .concat(
      user.recentContactLists
        .map(slug => lists.find(list => list.slug === slug))
        .filter(list => !!list)
    )
    .concat(
      lists.filter(list => !user.recentContactLists
        .find(slug => list.slug === slug))
    )

  const selectedSlug = userId ? 'my' : selectedMasterListSlug

  return { ...props, items, selectedSlug }
}, MasterListsSelector)

const ContactsTotal = ({ loading, total }) => {
  const suffix = `contact${total === 1 ? '' : 's'}`
  return (
    <div
      className='f-xs gray60'
      style={{position: 'relative', top: -35, right: 20, textAlign: 'right', zIndex: 0}}>
      { loading ? <Loading className='lolo-gray80' /> : null }
      { !loading && total ? <span>{total} {suffix}</span> : null }
    </div>
  )
}

export default compose(
  createSearchQueryContainer,
  createSearchEnricher,
  createLimitContainer,
  createSearchContainer,
  createSearchCountContainer,
  withSnackbar
)(ContactsPage)
