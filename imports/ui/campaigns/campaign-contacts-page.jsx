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
import { StatusIndex } from '/imports/api/contacts/status'
import { createContact } from '/imports/api/contacts/methods'
import RemoveContact from './remove-contact'
import Loading from '../lists/loading'

const CampaignContactsPage = React.createClass({
  propTypes: {
    loading: PropTypes.bool.isRequired,
    campaign: PropTypes.object
  },

  getInitialState () {
    return {
      createContactModalOpen: false,
      addContactModalOpen: false,
      removeContactModalOpen: false,
      sort: { updatedAt: -1 },
      selections: []
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

  onCreateContact (details) {
    createContact.call({details}, (err, res) => {
      if (err) {
        return console.log(err)
      }

      this.setState({
        addContactModalOpen: true,
        createContactModalOpen: false,
        contactPrefillData: null
      })
    })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onDeselectAllClick () {
    this.setState({ selections: [] })
  },

  contactQuery (term) {
    const contactSlugs = this.props.campaign.contacts ? Object.keys(this.props.campaign.contacts) : []

    let query = {
      slug: {
        $in: contactSlugs
      }
    }

    if (term) {
      const filterRegExp = new RegExp(term, 'gi')

      query = {
        $and: [{
          slug: {
            $in: contactSlugs
          }
        }, {
          $or: [{
            name: filterRegExp
          }, {
            'outlets.value': filterRegExp
          }, {
            'outlets.label': filterRegExp
          }]
        }]
      }
    }

    return query
  },

  onStatusFilterChange (filter) {
    if (!filter) {
      this.table.setFilter(() => true)
    } else {
      const contacts = this.props.campaign.contacts

      this.table.setFilter((contact) => contacts[contact.slug] === filter)
    }
  },

  render () {
    if (this.props.loading) {
      return (<div>
        <div className='center p4'>
          <Loading />
        </div>
      </div>)
    }

    const { campaign, contacts } = this.props

    const {
      onSortChange,
      onSelectionsChange,
      onAddContactClick,
      onCreateContactModalDismiss,
      onAddContactModalDismiss,
      onCreateContact,
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
        <CampaignSummary campaign={campaign} statusFilter={statusFilter} onStatusClick={this.onStatusFilterChange} />
        <ContactsTable ref={(table) => { this.table = table }}
          query={this.contactQuery}
          total={Object.keys(this.props.campaign.contacts).length}
          campaign={this.props.campaign}
          onSelectionChange={onSelectionsChange}
        />
        <ContactsActionsToast
          contacts={selections}
          onCampaignClick={() => console.log('TODO: add contacts to campaign')}
          onSectorClick={() => console.log('TODO: add/edit sectors')}
          onFavouriteClick={() => console.log('TODO: toggle favourite')}
          onTagClick={() => console.log('TODO: add/edit tags')}
          onDeleteClick={this.onShowRemoveContact}
          onDeselectAllClick={this.onDeselectAllClick} />
        <CreateContact
          open={createContactModalOpen}
          onDismiss={onCreateContactModalDismiss}
          onSubmit={onCreateContact}
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

// dir is -1 or 1. Returns a sort functon.
const contactStatusSort = ({contacts}, dir) => (a, b) => {
  const statusA = contacts[a.slug]
  const statusB = contacts[b.slug]
  return (StatusIndex[statusA] - StatusIndex[statusB]) * dir
}

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
    campaign: Campaigns.findOne({ slug: campaignSlug })
  }
}, CampaignContactsPage)
