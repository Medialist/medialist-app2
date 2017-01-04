import querystring from 'querystring'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData, createContainer } from 'meteor/react-meteor-data'
import { Link, withRouter } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import ContactsTable from './contacts-table'
import SearchBox from '../lists/search-box'
import ContactsActionsToast from './contacts-actions-toast'
import SectorSelector from '../campaigns/sector-selector.jsx'
import EditContact from './edit-contact.jsx'
import ContactListEmpty from './contacts-list-empty'
import { FeedContactIcon } from '../images/icons'

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

const ContactsPage = React.createClass({
  getInitialState () {
    return {
      selections: [],
      selectedSector: null,
      isDropdownOpen: false,
      addContactModalOpen: false
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

  onDeleteAllClick () {
    const { selections } = this.state
    const contactIds = selections.map((s) => s._id)
    Meteor.call('contacts/remove', contactIds, (err, res) => {
      if (err) return console.error('Removing contacts failed', err)
      this.setState({ selections: [] })
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

  render () {
    const { contactsCount, loading, searching, contacts, term, sort } = this.props
    const { onSortChange, onSelectionsChange, onSectorChange, onTermChange } = this
    const { selections } = this.state
    if (!loading && contactsCount === 0) return <ContactListEmpty />
    return (
      <div>
        <div className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <SectorSelectorContainer selected={this.state.selectedSector} onSectorChange={onSectorChange} />
          </div>
          <Dropdown>
            <div className='flex-none bg-white center px4'>
              <button className='btn bg-completed white ml4 mr1' onClick={this.toggleAddContactModal}>New Contact</button>
              <button className='btn bg-completed white mr4' onClick={this.onDropdownArrowClick} >
                <Arrow direction='down' style={{ marginLeft: 0 }} />
              </button>
              <DropdownMenu right style={{ top: '2.8rem', right: '2.7rem' }} open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
                <nav className='block border-top border-gray80 py1'>
                  <Link to='/contacts/import' className='block px3 py2 f-md normal gray20 hover-bg-gray90' activeClassName='active' onClick={this.onLinkClick}>
                    <FeedContactIcon />
                    <span className='ml2'>Import Contacts</span>
                  </Link>
                </nav>
              </DropdownMenu>
            </div>
          </Dropdown>
        </div>
        <div className='bg-white shadow-2 m4 mt8'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={onTermChange} placeholder='Search contacts...' />
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
          onCampaignClick={() => console.log('TODO: add contacts to campaign')}
          onSectorClick={() => console.log('TODO: add/edit sectors')}
          onFavouriteClick={() => console.log('TODO: toggle favourite')}
          onTagClick={() => console.log('TODO: add/edit tags')}
          onDeleteClick={this.onDeleteAllClick}
          onDeselectAllClick={this.onDeselectAllClick} />
        <EditContact
          onDismiss={this.toggleAddContactModal}
          onChange={this.onAddContactChange}
          onSubmit={this.onAddContactSubmit}
          open={this.state.addContactModalOpen} />
      </div>
    )
  }
})

const SectorSelectorContainer = createContainer((props) => {
  return { ...props, items, selected: props.selected || items[0] }
}, SectorSelector)

const ContactsTotal = ({ searching, results, total }) => {
  const num = searching ? results.length : total
  const label = searching ? 'match' : 'total'
  return <div>{num} contact{num === 1 ? '' : 's'} {label}</div>
}

// I decode and encode the search options from the query string
// and set up the subscriptions and collecton queries from those options.
const ContactsPageContainer = withRouter(React.createClass({
  mixins: [ReactMeteorData],

  // API is like setState..
  // Pass an obj with the new params you want to set on the query string.
  setQuery (opts) {
    const { location, router } = this.props
    const newQuery = {}
    if (opts.sort) newQuery.sort = JSON.stringify(opts.sort)
    if (opts.hasOwnProperty('term')) {
      newQuery.q = opts.term
    }
    const query = Object.assign({}, location.query, newQuery)
    if (query.q === '') delete query.q
    const qs = querystring.stringify(query)
    router.replace('/contacts?' + qs)
  },

  parseQuery ({query}) {
    const sort = query.sort ? JSON.parse(query.sort) : { updatedAt: -1 }
    const term = query.q || ''
    return { sort, term }
  },

  getMeteorData () {
    const { sort, term } = this.parseQuery(this.props.location)
    const subs = [ Meteor.subscribe('contactCount') ]
    const contactsCount = window.Counter.get('contactCount')
    const query = {}
    const minSearchLength = 3
    const searching = term.length >= minSearchLength
    if (searching) {
      const filterRegExp = new RegExp(term, 'gi')
      query.$or = [
        { name: filterRegExp },
        { jobTitles: filterRegExp },
        { primaryOutlets: filterRegExp }
      ]
      subs.push(Meteor.subscribe('contacts', {regex: term.substring(0, minSearchLength)}))
    }
    const contacts = window.Contacts.find(query, { sort }).fetch()
    const loading = !subs.every((sub) => sub.ready())
    return { contacts, contactsCount, loading, searching, sort, term }
  },

  render () {
    return <ContactsPage {...this.props} {...this.data} setQuery={this.setQuery} />
  }
}))

export default ContactsPageContainer

// Fake data
const items = [
  { _id: 0, name: 'All', count: 10 },
  { _id: 1, name: 'My campaigns', count: 5 },
  { _id: 2, name: 'Corporate', count: 97 },
  { _id: 3, name: 'Energy', count: 18 },
  { _id: 4, name: 'Consumer', count: 120 },
  { _id: 5, name: 'Healthcare', count: 55 },
  { _id: 6, name: 'Public Affairs', count: 37 },
  { _id: 7, name: 'Technology', count: 201 }
]
