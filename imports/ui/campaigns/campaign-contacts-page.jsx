import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactsTable from '../contacts/contacts-table'
import SearchBox from '../lists/search-box'
import ContactsActionsToast from '../contacts/contacts-actions-toast'
import CampaignTopbar from './campaign-topbar'
import CampaignSummary from './campaign-summary'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import { CreateContactModal } from '../contacts/edit-contact'
import AddContact from './add-contact'
import { StatusIndex } from '/imports/api/contacts/status'
import RemoveContact from './remove-contact'

const CampaignContactsPage = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contacts: PropTypes.array.isRequired,
    contactsAllCount: PropTypes.number.isRequired
  },

  getInitialState () {
    return {
      createContactModalOpen: false,
      addContactModalOpen: false,
      removeContactModalOpen: false,
      sort: { updatedAt: -1 },
      selections: [],
      term: '',
      statusFilter: ''
    }
  },

  onAddContactClick () {
    const { contactsAllCount } = this.props

    if (contactsAllCount) {
      const addContactModalOpen = !this.state.addContactModalOpen
      this.setState({ addContactModalOpen })
    } else {
      const createContactModalOpen = !this.state.createContactModalOpen
      this.setState({ createContactModalOpen })
    }
  },

  onCreateContactModalDismiss () {
    this.setState({ createContactModalOpen: false })
  },

  onAddContactModalDismiss () {
    this.setState({ addContactModalOpen: false })
  },

  onRemoveContactModalDismiss (contactsWereRemoved) {
    this.setState({
      removeContactModalOpen: false
    })

    if (contactsWereRemoved) {
      this.setState({
        selections: []
      })
    }
  },

  onShowCreateContact (data) {
    this.setState({
      addContactModalOpen: false,
      removeContactModalOpen: false,
      createContactModalOpen: true,
      contactPrefillData: data
    })
  },

  onShowRemoveContact (contacts) {
    this.setState({
      addContactModalOpen: false,
      removeContactModalOpen: true,
      createContactModalOpen: false,
      selections: contacts
    })
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
    const { campaign, contacts } = this.props
    if (!campaign) return null

    const {
      onSortChange,
      onSelectionsChange,
      onAddContactClick,
      onCreateContactModalDismiss,
      onAddContactModalDismiss,
      onShowCreateContact,
      onRemoveContactModalDismiss
    } = this

    const {
      addContactModalOpen,
      createContactModalOpen,
      contactPrefillData,
      sort,
      term,
      selections,
      statusFilter,
      removeContactModalOpen
    } = this.state

    return (
      <div>
        <CampaignTopbar campaign={campaign} onAddContactClick={onAddContactClick} />
        <CampaignSummary campaign={campaign} statusFilter={statusFilter} onStatusClick={(statusFilter) => this.setState({statusFilter})} />
        <div className='bg-white shadow-2 m4' data-id='contacts-table'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={this.onTermChange} placeholder='Search contacts...' data-id='search-contacts-input' />
            </div>
            <div className='flex-none pl4 f-xs'>
              <ContactsTotal total={contacts.length} />
            </div>
          </div>
          <ContactsTableContainer
            sort={sort}
            term={term}
            campaign={campaign}
            selections={selections}
            statusFilter={statusFilter}
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange}
            searching={Boolean(term)}
          />
        </div>
        <ContactsActionsToast
          contacts={selections}
          onCampaignClick={() => console.log('TODO: add contacts to campaign')}
          onSectorClick={() => console.log('TODO: add/edit sectors')}
          onFavouriteClick={() => console.log('TODO: toggle favourite')}
          onTagClick={() => console.log('TODO: add/edit tags')}
          onDeleteClick={this.onShowRemoveContact}
          onDeselectAllClick={this.onDeselectAllClick} />
        <CreateContactModal
          open={createContactModalOpen}
          onDismiss={onCreateContactModalDismiss}
          campaign={campaign}
          prefill={contactPrefillData} />
        <AddContact
          open={addContactModalOpen}
          onDismiss={onAddContactModalDismiss}
          onCreate={onShowCreateContact}
          campaign={campaign}
          campaignContacts={contacts} />
        <RemoveContact
          open={removeContactModalOpen}
          onDismiss={onRemoveContactModalDismiss}
          campaign={campaign}
          contacts={this.state.selections} />
      </div>
    )
  }
})

const ContactsTotal = ({ total }) => (
  <div>{total} contact{total === 1 ? '' : 's'} total</div>
)

// dir is -1 or 1. Returns a sort functon.
const contactStatusSort = ({contacts}, dir) => (a, b) => {
  const statusA = contacts[a.slug]
  const statusB = contacts[b.slug]
  return (StatusIndex[statusA] - StatusIndex[statusB]) * dir
}

const ContactsTableContainer = createContainer((props) => {
  const { campaign, term, sort, statusFilter } = props
  const contactIds = campaign.contacts ? Object.keys(campaign.contacts) : []
  let query = { slug: { $in: contactIds } }
  if (term) {
    const filterRegExp = new RegExp(term, 'gi')
    query = {
      $and: [
        { slug: { $in: contactIds } },
        { $or: [
          { name: filterRegExp },
          { 'outlets.value': filterRegExp },
          { 'outlets.label': filterRegExp }
        ]}
      ]
    }
  }
  let contacts = Contacts.find(query, { sort }).fetch()
  if (statusFilter) {
    contacts = contacts.filter((c) => campaign.contacts[c.slug] === statusFilter)
  }
  if (sort.status) {
    contacts.sort(contactStatusSort(campaign, sort.status))
  }
  return { ...props, contacts }
}, ContactsTable)

export default createContainer((props) => {
  const { campaignSlug } = props.params

  const subs = [
    Meteor.subscribe('campaign', campaignSlug),
    Meteor.subscribe('contacts-by-campaign', campaignSlug),
    Meteor.subscribe('contactCount')
  ]
  const loading = subs.some((s) => !s.ready())

  return {
    ...props,
    loading,
    campaign: Campaigns.findOne({ slug: campaignSlug }),
    contacts: Contacts.find({campaigns: campaignSlug}, {sort: {updatedAt: -1}}).fetch(),
    contactsAllCount: Contacts.allContactsCount(),
    user: Meteor.user()
  }
}, CampaignContactsPage)
