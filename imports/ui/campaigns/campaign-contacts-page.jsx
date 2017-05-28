import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import escapeRegExp from 'lodash.escaperegexp'
import { createContainer } from 'meteor/react-meteor-data'
import ContactsTable from '/imports/ui/contacts/contacts-table'
import SearchBox from '/imports/ui/lists/search-box'
import ContactsActionsToast from '/imports/ui/contacts/contacts-actions-toast'
import CampaignTopbar from '/imports/ui/campaigns/campaign-topbar'
import CampaignSummary from '/imports/ui/campaigns/campaign-summary'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import { CreateContactModal } from '../contacts/edit-contact'
import AddContactModal from '/imports/ui/campaigns/add-contact'
import { StatusIndex } from '/imports/api/contacts/status'
import RemoveContactModal from '/imports/ui/campaigns/remove-contact'
import AddContactsToCampaign from '/imports/ui/contacts/add-contacts-to-campaign'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import AddToMasterList from '/imports/ui/master-lists/add-to-master-list'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchFavouriteContacts } from '/imports/api/contacts/methods'

class CampaignContactsPage extends React.Component {

  constructor (props, context) {
    super(props, context)

    this.state = {
      selections: [],
      isDropdownOpen: false,
      addContactModal: false,
      createContactModal: false,
      addContactsToCampaignModal: false,
      addTagsModal: false,
      addToMasterListsModal: false,
      removeContactsModal: false,
      sort: { updatedAt: -1 },
      term: '',
      statusFilter: ''
    }
  }

  onAddContactClick () {
    if (this.props.contactsAllCount) {
      this.showModal('addContactModal')
    } else {
      this.showModal('createContactModal')
    }
  }

  onFavouriteAll () {
    const contactSlugs = this.state.selections.map((s) => s.slug)

    batchFavouriteContacts.call({contactSlugs}, (error) => {
      if (error) {
        console.log(error)
        return this.context.snackbar.error('batch-favourite-contacts-failure')
      }
      this.context.snackbar.show(`Favourited ${contactSlugs.length} ${contactSlugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-favourite-contacts-success')
    })
  }

  onTagAll (tags) {
    const slugs = this.state.selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)

    batchAddTags.call({type: 'Contacts', slugs, names}, (error) => {
      if (error) {
        console.error(error)
        return this.context.snackbar.error('batch-tag-contacts-failure')
      }

      this.context.snackbar.show(`Added ${names.length} ${names.length === 1 ? 'tag' : 'tags'} to ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-tag-contacts-success')
    })
  }

  onAddAllToMasterLists (masterLists) {
    const slugs = this.state.selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)

    batchAddToMasterLists.call({type: 'Contacts', slugs, masterListIds}, (error) => {
      if (error) {
        console.error(error)
        return this.context.snackbar.error('contacts-batch-add-to-contact-list-failure')
      }

      this.context.snackbar.show(`Added ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'} to ${masterLists.length} ${masterLists.length === 1 ? 'Contact List' : 'Contact Lists'}`, 'batch-add-contacts-to-contact-list-success')
    })
  }

  onShowCreateContact (data) {
    this.setState({
      contactPrefillData: data
    })

    this.showModal('createContactModal')
  }

  onSortChange (sort) {
    this.setState({ sort })
  }

  onTermChange (term) {
    this.setState({ term })
  }

  onSelectionsChange (selections) {
    this.setState({ selections })
  }

  clearSelection () {
    this.setState({
      selections: []
    })
  }

  showModal (modal) {
    this.hideModals()

    this.setState((s) => ({
      [modal]: true
    }))
  }

  hideModals () {
    this.setState({
      addContactModal: false,
      createContactModal: false,
      addContactsToCampaignModal: false,
      addTagsModal: false,
      addToMasterListsModal: false,
      removeContactsModal: false
    })
  }

  render () {
    const { campaign, contacts } = this.props

    if (!campaign) {
      return null
    }

    const {
      contactPrefillData,
      sort,
      term,
      selections,
      statusFilter
    } = this.state

    return (
      <div>
        <CampaignTopbar campaign={campaign} onAddContactClick={() => this.onAddContactClick()} />
        <CampaignSummary campaign={campaign} statusFilter={statusFilter} onStatusClick={(statusFilter) => this.setState({statusFilter})} />
        <div className='bg-white shadow-2 m4' data-id='contacts-table'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={(term) => this.onTermChange(term)} placeholder='Search contacts...' data-id='search-contacts-input' />
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
            onSortChange={(sort) => this.onSortChange(sort)}
            onSelectionsChange={(selections) => this.onSelectionsChange(selections)}
            searching={Boolean(term)}
          />
        </div>
        <ContactsActionsToast
          campaign={campaign}
          contacts={selections}
          onCampaignClick={() => this.showModal('addContactsToCampaignModal')}
          onSectorClick={() => this.showModal('addToMasterListsModal')}
          onFavouriteClick={() => this.onFavouriteAll()}
          onTagClick={() => this.showModal('addTagsModal')}
          onDeleteClick={() => this.showModal('removeContactsModal')}
          onDeselectAllClick={() => this.clearSelection()} />
        <CreateContactModal
          open={this.state.createContactModal}
          onDismiss={() => this.hideModals()}
          campaign={campaign}
          prefill={contactPrefillData} />
        <AddContactModal
          open={this.state.addContactModal}
          onDismiss={() => this.hideModals()}
          onCreate={(data) => this.onShowCreateContact(data)}
          campaign={campaign}
          campaignContacts={contacts} />
        <AddContactsToCampaign
          title='Add these Contacts to a Campaign'
          contacts={this.state.selections}
          onDismiss={() => this.hideModals()}
          open={this.state.addContactsToCampaignModal}>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddContactsToCampaign>
        <AddTagsModal
          type='Contacts'
          open={this.state.addTagsModal}
          onDismiss={() => this.hideModals()}
          onUpdateTags={(tags) => this.onTagAll(tags)}
          title='Tag these Contacts'>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddTagsModal>
        <AddToMasterList
          type='Contacts'
          items={this.state.selections}
          open={this.state.addToMasterListsModal}
          onDismiss={() => this.hideModals()}
          onSave={(masterLists) => this.onAddAllToMasterLists(masterLists)}
          title='Add to a Contact List'>
          <AbbreviatedAvatarList items={selections} maxTooltip={12} />
        </AddToMasterList>
        <RemoveContactModal
          open={this.state.removeContactsModal}
          onDismiss={() => this.hideModals()}
          campaign={campaign}
          contacts={this.state.selections} />
      </div>
    )
  }
}

CampaignContactsPage.propTypes = {
  campaign: PropTypes.object,
  contacts: PropTypes.array.isRequired,
  contactsAllCount: PropTypes.number.isRequired
}

CampaignContactsPage.contextTypes = {
  snackbar: PropTypes.object
}

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
    const filterRegExp = new RegExp(escapeRegExp(term), 'gi')
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

  let contacts = Contacts.find(query, {
    sort
  }).fetch()

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
