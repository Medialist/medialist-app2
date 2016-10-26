import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactsTable from './contacts-table'
import SearchBox from '../lists/search-box'
import ContactsActionsToast from './contacts-actions-toast'
import SectorSelector from '../campaigns/sector-selector.jsx'

const ContactsPage = React.createClass({
  getInitialState () {
    return {
      sort: { updatedAt: -1 },
      selections: [],
      term: '',
      selectedSector: null
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

  render () {
    const { onSortChange, onSelectionsChange, onSectorChange } = this
    const { sort, term, selections } = this.state

    return (
      <div>
        <SectorSelectorContainer selected={this.state.selectedSector} onSectorChange={onSectorChange} />
        <div className='bg-white shadow-2 m4'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={this.onTermChange} placeholder='Search contacts...' />
            </div>
            <div className='flex-none pl4 f-xs'>
              <ContactsTotalContainer />
            </div>
          </div>
          <ContactsTableContainer
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
          onDeleteClick={() => console.log('TODO: delete contact(s)')}
          onDeselectAllClick={this.onDeselectAllClick} />
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

const ContactsTotalContainer = createContainer((props) => {
  return { ...props, total: window.Contacts.find({}).count() }
}, ContactsTotal)

const ContactsTableContainer = createContainer((props) => {
  Meteor.subscribe('contacts')

  const query = {}

  if (props.term) {
    const filterRegExp = new RegExp(props.term, 'gi')
    query.$or = [
      { name: filterRegExp },
      { jobTitles: filterRegExp },
      { primaryOutlets: filterRegExp }
    ]
  }

  const contacts = window.Contacts.find(query, { sort: props.sort }).fetch()
  return { ...props, contacts }
}, ContactsTable)

export default ContactsPage

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
