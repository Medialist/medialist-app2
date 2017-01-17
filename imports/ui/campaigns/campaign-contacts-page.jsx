import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactsTable from '../contacts/contacts-table'
import SearchBox from '../lists/search-box'
import ContactsActionsToast from '../contacts/contacts-actions-toast'
import CampaignTopbar from './campaign-topbar'
import CampaignSummary from './campaign-summary'
import Medialists from '/imports/api/medialists/medialists'
import AddContact from './add-contact'

const CampaignContactsPage = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contacts: PropTypes.array,
    contactsAll: PropTypes.array,
    router: PropTypes.object
  },

  getInitialState () {
    return {
      addContactOpen: false,
      sort: { updatedAt: -1 },
      selections: [],
      term: ''
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

  onStatusChange ({status, contact}) {
    const post = {
      contactSlug: contact.slug,
      medialistSlug: this.props.campaign.slug,
      status
    }
    Meteor.call('posts/create', post)
  },

  toggleAddContact () {
    const addContactOpen = !this.state.addContactOpen
    this.setState({ addContactOpen })
  },

  render () {
    const { campaign, contacts, contactsAll } = this.props
    if (!campaign) return null
    const { onSortChange, onSelectionsChange, onStatusChange, toggleAddContact } = this
    const { addContactOpen, sort, term, selections } = this.state
    return (
      <div>
        <CampaignTopbar campaign={campaign} onAddContactClick={toggleAddContact} />
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
        <AddContact onDismiss={toggleAddContact} open={addContactOpen} contacts={contacts} contactsAll={contactsAll} campaign={campaign} />
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
  const contacts = window.Contacts.find(query, { sort }).fetch()
  return { ...props, contacts }
}, ContactsTable)

export default createContainer((props) => {
  const { slug } = props.params

  const subs = [
    Meteor.subscribe('medialist', slug),
    Meteor.subscribe('contacts')
  ]
  const loading = subs.some((s) => !s.ready())

  return {
    ...props,
    loading,
    campaign: Medialists.findOne({ slug }),
    // TODO: need to be able to sort contacts by recently updated with respect to the campaign.
    contacts: window.Contacts.find({medialists: slug}, {sort: {updatedAt: -1}}).fetch(),
    contactsAll: window.Contacts.find({}, {sort: {name: 1}}).fetch(),
    user: Meteor.user()
  }
}, withRouter(CampaignContactsPage))
