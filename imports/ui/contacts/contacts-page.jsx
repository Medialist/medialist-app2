import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { Link } from 'react-router'
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

const ContactsPage = React.createClass({
  getInitialState () {
    return {
      sort: { updatedAt: -1 },
      selections: [],
      term: '',
      selectedSector: null,
      isDropdownOpen: false,
      addContactModalOpen: false
    }
  },

  onSectorChange (selectedSector) {
    this.setState({ selectedSector })
  },

  onSortChange (sort) {
    this.setState({ sort })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onTermChange (term) {
    this.setState({ term })
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
    contact.jobTitles = (contact.jobTitles || '').split(/,\s*/)
    contact.outlets = (contact.primaryOutlets || '').split(/,\s*/).map((outlet) => ({
      label: outlet,
      value: contact.jobTitles[0]
    }))
    delete contact.jobTitles
    delete contact.primaryOutlets
    console.log('submit', contact)
  },

  render () {
    const { onSortChange, onSelectionsChange, onSectorChange } = this
    const { sort, term, selections } = this.state
    const { contactsCount, loading } = this.props
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
              <SearchBox onTermChange={this.onTermChange} placeholder='Search contacts...' />
            </div>
            <div className='flex-none pl4 f-xs'>
              <ContactsTotal total={contactsCount} />
            </div>
          </div>
          <ContactsTableContainer
            loading={loading}
            sort={sort}
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

const ContactsTotal = ({ total }) => (
  <div>{total} contact{total === 1 ? '' : 's'} total</div>
)

const ContactsPageContainer = createContainer((props) => {
  const sub = Meteor.subscribe('contacts')
  const loading = !sub.ready()
  const contactsCount = loading ? [] : window.Contacts.find({}).count()
  return { ...props, contactsCount, loading }
}, ContactsPage)

const ContactsTableContainer = createContainer((props) => {
  const query = {}
  if (props.term) {
    const filterRegExp = new RegExp(props.term, 'gi')
    query.$or = [
      { name: filterRegExp },
      { jobTitles: filterRegExp },
      { 'outlets.label': filterRegExp }
    ]
  }
  const contacts = window.Contacts.find(query, { sort: props.sort }).fetch()
  return { ...props, contacts }
}, ContactsTable)

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
