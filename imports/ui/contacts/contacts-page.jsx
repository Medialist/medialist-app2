import querystring from 'querystring'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import MasterLists from '../../api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import { Link, withRouter } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import ContactsTable from './contacts-table'
import SearchBox from '../lists/search-box'
import ContactsActionsToast from './contacts-actions-toast'
import MasterListsSelector from '../campaigns/masterlists-selector.jsx'
import EditContact from './edit-contact.jsx'
import ContactListEmpty from './contacts-list-empty'
import { FeedContactIcon } from '../images/icons'
import createSearchContainer from './search-container'
import AddContactsToCampaigns from './add-contacts-to-campaigns'
import Medialists from '/imports/api/medialists/medialists'
import { AvatarTag } from '../tags/tag'
import { batchFavouriteContacts } from '/imports/api/contacts/methods'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import withSnackbar from '../snackbar/with-snackbar'
import AddTags from '../tags/add-tags'
import AbbreviatedAvatarList from '../lists/abbreviated-avatar-list.jsx'
import AddToMasterList from '../master-lists/add-to-master-list.jsx'

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
      selectedSector: null,
      isDropdownOpen: false,
      addContactModalOpen: false,
      addContactsToCampaignsModalOpen: false,
      addTagsOpen: false,
      addToMasterListsOpen: false
    }
  },

  onSectorChange (selectedSector) {
    this.setState({ selectedSector })
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

  onDeselectAllClick () {
    this.setState({ selections: [] })
  },

  onFavouriteAll () {
    const { snackbar } = this.props
    const { selections } = this.state
    const contactSlugs = selections.map((s) => s.slug)
    batchFavouriteContacts.call({contactSlugs}, (err, res) => {
      if (err) {
        console.log(err)
        return snackbar.show('Sorry, that didn\'t work')
      }
      snackbar.show(`Favourited ${contactSlugs.length} ${contactSlugs.length === 1 ? 'contact' : 'contacts'}`)
    })
  },

  onTagAll (tags) {
    const { snackbar } = this.props
    const { selections } = this.state
    const slugs = selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)
    batchAddTags.call({type: 'Contacts', slugs, names}, (err, res) => {
      if (err) {
        console.log(err)
        return snackbar.show('Sorry, that didn\'t work')
      }
      snackbar.show(`Add ${names.length} ${names.length === 1 ? 'tag' : 'tags'} to ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'}`)
    })
  },

  onAddAllToMasterLists (masterLists) {
    const { snackbar } = this.props
    const { selections } = this.state
    const slugs = selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)
    console.log({slugs, masterListIds})
    batchAddToMasterLists.call({type: 'Contacts', slugs, masterListIds}, (err, res) => {
      if (err) {
        console.log(err)
        return snackbar.show('Sorry, that didn\'t work')
      }
      snackbar.show(`Added ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'} to ${masterLists.length} ${masterLists.length === 1 ? 'Master List' : 'Master Lists'}`)
    })
  },

  onDeleteAllClick () {
    const { snackbar } = this.props
    const { selections } = this.state
    const contactIds = selections.map((s) => s._id)
    Meteor.call('contacts/remove', contactIds, (err, res) => {
      if (err) return console.error('Removing contacts failed', err)
      this.setState({ selections: [] })
      snackbar.show(`Deleted ${contactIds.length} ${contactIds.length === 1 ? 'contacts' : 'contact'}`)
    })
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

  toggleAddContactModal () {
    this.setState({ addContactModalOpen: !this.state.addContactModalOpen })
  },

  onAddContactChange (contact) {
    console.log('change', contact)
  },

  onAddContactSubmit (contact) {
    console.log('submit', contact)
  },

  onCampaignRemove (campaign) {
    const { setQuery, campaignSlugs } = this.props
    setQuery({
      campaignSlugs: campaignSlugs.filter((str) => str !== campaign.slug)
    })
  },

  render () {
    const { contactsCount, loading, searching, contacts, term, sort, campaigns } = this.props
    const { onSortChange, onSelectionsChange, onSectorChange, onTermChange, onCampaignRemove } = this
    const { selections } = this.state
    if (!loading && contactsCount === 0) return <ContactListEmpty />
    return (
      <div>
        <div style={{height: 58}} className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <MasterListsSelectorContainer selected={this.state.selectedSector} onSectorChange={onSectorChange} />
          </div>
          <div className='flex-none bg-white center px4' style={{width: 240}}>
            <button className='btn bg-completed white mr1' onClick={this.toggleAddContactModal}>New Contact</button>
            <Dropdown>
              <button className='btn bg-completed white' onClick={this.onDropdownArrowClick} >
                <Arrow direction='down' style={{ marginLeft: 0 }} />
              </button>
              <DropdownMenu width={210} left={-165} top={0} open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
                <nav className='block py1'>
                  <Link to='/contacts/import' className='block px3 py2 f-md normal gray20 hover-bg-gray90' activeClassName='active' onClick={this.onLinkClick}>
                    <FeedContactIcon />
                    <span className='ml2'>Import Contacts</span>
                  </Link>
                </nav>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className='bg-white shadow-2 m4 mt8'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={onTermChange} placeholder='Search contacts...'>
                <div style={{marginBottom: -4}} >
                  {campaigns && campaigns.map((c) => (
                    <AvatarTag
                      key={c.slug}
                      name={c.name}
                      avatar={c.avatar}
                      onRemove={() => onCampaignRemove(c)}
                    />
                  ))}
                </div>
              </SearchBox>
            </div>
            <div className='flex-none pl4 f-xs'>
              <ContactsTotal searching={searching} results={contacts} total={contactsCount} />
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
            onSelectionsChange={onSelectionsChange} />
        </div>
        <ContactsActionsToast
          contacts={selections}
          onCampaignClick={() => this.setState({addContactsToCampaignsModalOpen: true})}
          onSectorClick={() => this.setState({addToMasterListsOpen: true})}
          onFavouriteClick={this.onFavouriteAll}
          onTagClick={() => this.setState({addTagsOpen: true})}
          onDeleteClick={this.onDeleteAllClick}
          onDeselectAllClick={this.onDeselectAllClick} />
        <EditContact
          onDismiss={this.toggleAddContactModal}
          onChange={this.onAddContactChange}
          onSubmit={this.onAddContactSubmit}
          open={this.state.addContactModalOpen} />
        <AddContactsToCampaigns
          contacts={selections}
          onDismiss={() => this.setState({addContactsToCampaignsModalOpen: false})}
          onSubmit={() => this.setState({addContactsToCampaignsModalOpen: false})}
          open={this.state.addContactsToCampaignsModalOpen} />
        <AddTags
          type='Contacts'
          open={this.state.addTagsOpen}
          onDismiss={() => this.setState({addTagsOpen: false})}
          onUpdateTags={this.onTagAll}
          title='Tag these Contacts'>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddTags>
        <AddToMasterList
          type='Contacts'
          open={this.state.addToMasterListsOpen}
          onDismiss={() => this.setState({addToMasterListsOpen: false})}
          onSave={this.onAddAllToMasterLists}>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddToMasterList>
      </div>
    )
  }
}))

const MasterListsSelectorContainer = createContainer((props) => {
  const items = MasterLists.find({type: 'Contacts'}).fetch()
  return { ...props, items, selected: props.selected || items[0] }
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
  // API is like setState..
  // Pass an obj with the new params you want to set on the query string.
  setQuery (opts) {
    const { location, router } = this.props
    const newQuery = {}
    if (opts.sort) newQuery.sort = JSON.stringify(opts.sort)
    if (opts.hasOwnProperty('term')) {
      newQuery.q = opts.term
    }
    if (opts.campaignSlugs) newQuery.campaign = opts.campaignSlugs
    const query = Object.assign({}, location.query, newQuery)
    if (query.q === '') delete query.q
    const qs = querystring.stringify(query)
    router.replace('/contacts?' + qs)
  },

  parseQuery ({query}) {
    const sort = query.sort ? JSON.parse(query.sort) : { updatedAt: -1 }
    const term = query.q || ''
    const { campaign } = query
    if (!campaign) return { sort, term, campaignSlugs: [], campaigns: [] }

    const campaignSlugs = Array.isArray(campaign) ? campaign : [campaign]
    const campaigns = Medialists.find({slug: {$in: campaignSlugs}}).fetch()
    return { sort, term, campaignSlugs, campaigns }
  },

  render () {
    const { location } = this.props
    return (
      <SearchableContactsPage
        {...this.props}
        {...this.data}
        {...this.parseQuery(location)}
        setQuery={this.setQuery} />
    )
  }
}))

export default ContactsPageContainer
