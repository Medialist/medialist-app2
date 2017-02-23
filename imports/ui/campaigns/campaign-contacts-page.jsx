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
import CreateContact from '../contacts/edit-contact'
import AddContact from './add-contact'

const CampaignContactsPage = React.createClass({
  propTypes: {
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    contactsAllCount: PropTypes.number.isRequired
  },

  getInitialState () {
    return {
      createContactModalOpen: false,
      addContactModalOpen: false,
      sort: { updatedAt: -1 },
      selections: [],
      term: ''
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

  onCreateContact (data) {
    this.setState({
      addContactModalOpen: false,
      createContactModalOpen: true,
      contactPrefillData: data
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

  onStatusChange ({status, contact}) {
    const post = {
      contactSlug: contact.slug,
      campaignSlug: this.props.campaign.slug,
      status
    }
    Meteor.call('posts/create', post)
  },

  render () {
    const { campaign, contacts } = this.props
    if (!campaign) return null

    const {
      onSortChange,
      onSelectionsChange,
      onStatusChange,
      onAddContactClick,
      onCreateContactModalDismiss,
      onAddContactModalDismiss,
      onCreateContact
    } = this

    const {
      addContactModalOpen,
      createContactModalOpen,
      contactPrefillData,
      sort,
      term,
      selections
    } = this.state

    return (
      <div>
        <CampaignTopbar campaign={campaign} onAddContactClick={onAddContactClick} />
        <CampaignSummary campaign={campaign} />
        <div className='bg-white shadow-2 m4'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={this.onTermChange} placeholder='Search contacts...' />
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
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange}
            onStatusChange={onStatusChange} />
        </div>
        <ContactsActionsToast
          contacts={selections}
          onCampaignClick={() => console.log('TODO: add contacts to campaign')}
          onSectorClick={() => console.log('TODO: add/edit sectors')}
          onFavouriteClick={() => console.log('TODO: toggle favourite')}
          onTagClick={() => console.log('TODO: add/edit tags')}
          onDeleteClick={() => console.log('TODO: delete contact(s)')}
          onDeselectAllClick={this.onDeselectAllClick} />
        <CreateContact
          open={createContactModalOpen}
          onDismiss={onCreateContactModalDismiss}
          campaign={campaign}
          prefill={contactPrefillData} />
        <AddContact
          open={addContactModalOpen}
          onDismiss={onAddContactModalDismiss}
          onCreate={onCreateContact}
          campaign={campaign}
          campaignContacts={contacts} />
      </div>
    )
  }
})

const ContactsTotal = ({ total }) => (
  <div>{total} contact{total === 1 ? '' : 's'} total</div>
)

const ContactsTableContainer = createContainer((props) => {
  const { campaign, term, sort } = props
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
  const contacts = Contacts.find(query, { sort }).fetch()
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
    // TODO: need to be able to sort contacts by recently updated with respect to the campaign.
    contacts: Contacts.find({campaigns: campaignSlug}, {sort: {updatedAt: -1}}).fetch(),
    contactsAllCount: window.Counter.get('contactCount'),
    user: Meteor.user()
  }
}, CampaignContactsPage)
