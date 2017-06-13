import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Modal from '/imports/ui/navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon } from '/imports/ui/images/icons'
import AvatarList from '/imports/ui/lists/avatar-list'
import CampaignContact from '/imports/ui/campaigns/campaign-contact'
import createSearchContainer from '/imports/ui/contacts/search-container'
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { BLUE } from '/imports/ui/colours'
import Scroll from '/imports/ui/navigation/scroll'

const AddContact = React.createClass({
  propTypes: {
    term: PropTypes.string,
    onTermChange: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSelected: PropTypes.func.isRequired,
    isSelectable: PropTypes.func.isRequired,
    selectedContacts: PropTypes.array.isRequired,
    contacts: PropTypes.array.isRequired // Search results
  },

  onChange (e) {
    this.props.onTermChange(e.target.value)
  },

  onKeyPress (e) {
    if (e.key !== 'Enter') return

    const { term, contacts, onAdd, onTermChange } = this.props
    if (!term) return

    const contact = contacts[0]

    if (!contact || this.props.isSelected(contact)) return

    onAdd(contact)
    onTermChange('')
  },

  render () {
    const {
      term,
      onReset,
      onSubmit,
      selectedContacts,
      onAdd,
      onRemove,
      onCreate,
      contacts
    } = this.props

    const { onChange, onKeyPress } = this

    return (
      <div data-id='add-contacts-to-campaign-modal'>
        <h1 className='f-xl regular center mt6'>Add Contacts to this Campaign</h1>
        <AvatarList items={selectedContacts} onRemove={onRemove} className='my4 px4' />
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2 placeholder-gray60' placeholder='Find a contact...' onChange={onChange} style={{outline: 'none'}} onKeyPress={onKeyPress} value={term} data-id='search-contacts-input' />
        </div>
        <Scroll height={'calc(95vh - 250px)'}>
          <ContactsList
            isSelected={this.props.isSelected}
            isSelectable={this.props.isSelectable}
            onAdd={onAdd}
            onRemove={onRemove}
            contacts={contacts}
            searching={Boolean(this.props.term)} />
          <CreateContactButton term={term} onCreate={onCreate} />
        </Scroll>
        <form className='py4 border-top border-gray80 flex' onReset={onReset} onSubmit={onSubmit}>
          <div className='flex-auto'>
            <Link to='/contacts/import' className='btn bg-transparent blue ml1' data-id='import-contacts-button'>
              Import Contacts via CSV
            </Link>
          </div>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' type='reset' data-id='cancel-button'>Cancel</button>
            <button className='btn bg-blue white px3 mr4' type='submit' data-id='save-button'>{selectedContacts.length === 0 ? 'Add Contacts' : `Add ${selectedContacts.length} Contact${selectedContacts.length > 1 ? 's' : ''}`}</button>
          </div>
        </form>
      </div>
    )
  }
})

const SearchableAddContact = createSearchContainer(AddContact)

const AddContactContainer = withSnackbar(React.createClass({
  propTypes: {
    onCreate: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    campaignContacts: PropTypes.array
  },

  getDefaultProps () {
    return {
      campaignContacts: []
    }
  },

  getInitialState () {
    return {
      selectedContacts: [],
      term: ''
    }
  },

  // Is the contact in the campaign or in selected contacts list?
  isSelected (contact) {
    return this.state.selectedContacts.some((c) => c._id === contact._id)
  },

  // Is the contact not on the campaign already
  isSelectable (contact) {
    return !this.props.campaignContacts.some((c) => c._id === contact._id)
  },

  onAdd (contact) {
    this.setState({
      selectedContacts: this.state.selectedContacts.concat(contact)
    })
  },

  onSubmit (event) {
    event.preventDefault()

    const contactSlugs = this.state.selectedContacts.map((c) => c.slug)
    const campaignSlug = this.props.campaign.slug

    if (contactSlugs.length > 0) {
      addContactsToCampaign.call({contactSlugs, campaignSlug}, (error) => {
        if (error) {
          console.log(error)
          return this.props.snackbar.error('batch-add-contacts-to-campaign-failure')
        }

        this.props.snackbar.show(`Added ${contactSlugs.length} Contact${contactSlugs.length > 1 ? 's' : ''} to Campaign`, 'batch-add-contacts-to-campaign-success')
      })
    }

    this.onReset()
  },

  onRemove (contact) {
    this.setState({
      selectedContacts: this.state.selectedContacts.filter((c) => c._id !== contact._id)
    })
  },

  onReset () {
    this.props.onDismiss()
    this.deselectAll()
  },

  deselectAll () {
    this.setState({ selectedContacts: [] })
  },

  onTermChange (term) {
    this.setState({ term })
  },

  render () {
    const {
      onTermChange,
      onAdd,
      onRemove,
      onReset,
      onSubmit
    } = this

    const { term, selectedContacts } = this.state
    const { onCreate } = this.props

    return (
      <SearchableAddContact
        term={term}
        onTermChange={onTermChange}
        isSelected={this.isSelected}
        isSelectable={this.isSelectable}
        onAdd={onAdd}
        onRemove={onRemove}
        onCreate={onCreate}
        onReset={onReset}
        onSubmit={onSubmit}
        selectedContacts={selectedContacts} />
    )
  }
}))

export default Modal(AddContactContainer)

const ContactsList = React.createClass({
  propTypes: {
    isSelected: PropTypes.func.isRequired,
    isSelectable: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    searching: PropTypes.bool.isRequired
  },

  onContactClick (contact, isSelected) {
    return isSelected ? this.props.onRemove(contact) : this.props.onAdd(contact)
  },

  render () {
    return (
      <div data-id={`contacts-table-${this.props.searching ? 'search-results' : 'unfiltered'}`}>
        {this.props.contacts.map((contact) => {
          const isSelected = this.props.isSelected(contact)
          const isSelectable = this.props.isSelectable(contact)

          if (isSelected) {
            return <SelectedContact contact={contact} onContactClick={this.onContactClick} key={contact.slug} />
          }

          if (isSelectable) {
            return <SelectableContact contact={contact} onContactClick={this.onContactClick} key={contact.slug} />
          }

          return <UnselectabledContact contact={contact} key={contact.slug} />
        })}
      </div>
    )
  }
})

const CreateContactButton = ({ term, onCreate }) => {
  if (!term) return null
  const onCreateClick = () => onCreate({ name: term })
  return (
    <div key='createContact' className='p4 center'>
      <button type='button' className='btn bg-blue white' onClick={onCreateClick}>
        Create new Contact "{term}"
      </button>
    </div>
  )
}

const SelectableContact = ({contact, onContactClick}) => {
  return (
    <div className='flex items-center border-bottom border-gray80 py2 pl4 pointer hover-bg-gray90 hover-color-trigger hover-opacity-trigger'
      onClick={() => onContactClick(contact, false)}>
      <div className='flex-auto'>
        <CampaignContact contact={contact} />
      </div>
      <div className='flex-none px4 f-sm gray40 hover-gray20'>
        {`${contact.campaigns.length} ${contact.campaigns.length === 1 ? 'campaign' : 'campaigns'}`}
      </div>
      <div className='flex-none px4 opacity-0 hover-opacity-100'>
        <AddIcon data-id='add-button' style={{fill: BLUE}} />
      </div>
    </div>
  )
}

const SelectedContact = ({contact, onContactClick}) => {
  return (
    <div className='flex items-center border-bottom border-gray80 py2 pl4 active pointer hover-bg-gray90 hover-color-trigger hover-opacity-trigger'
      onClick={() => onContactClick(contact, true)}>
      <div className='flex-auto'>
        <CampaignContact contact={contact} highlighted />
      </div>
      <div className='flex-none px4 f-sm gray40 hover-gray20'>
        {`${contact.campaigns.length} ${contact.campaigns.length === 1 ? 'campaign' : 'campaigns'}`}
      </div>
      <div className='flex-none px4 hover-opacity-100'>
        <SelectedIcon style={{fill: BLUE}} />
      </div>
    </div>
  )
}

const UnselectabledContact = ({contact}) => {
  return (
    <div className='flex items-center border-bottom border-gray80 py2 pl4 opacity-50'>
      <div className='flex-auto'>
        <CampaignContact contact={contact} highlighted />
      </div>
      <div className='flex-none px4 f-sm gray40'>
        Already in campaign
      </div>
      <div className='flex-none px4'>
        <SelectedIcon style={{fill: BLUE}} />
      </div>
    </div>
  )
}
