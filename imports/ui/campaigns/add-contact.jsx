import { Meteor } from 'meteor/meteor'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { MouseHoveringDetection } from 'react-detect-mouse-over'
import Modal from '/imports/ui/navigation/modal'
import { AddIcon, SelectedIcon } from '/imports/ui/images/icons'
import AvatarList from '/imports/ui/lists/avatar-list'
import CampaignContact from '/imports/ui/campaigns/campaign-contact'
import createSearchContainer from '/imports/ui/contacts/search-container'
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { BLUE } from '/imports/ui/colours'
import Scroll from '/imports/ui/navigation/scroll'
import SearchBox from '/imports/ui/lists/search-box'

class AddContact extends React.Component {
  static propTypes = {
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
  }

  onTermChange = (term) => {
    this.props.onTermChange(term)
  }

  onKeyDown = (e) => {
    if (e.key !== 'Enter') return

    const { term, contacts, onAdd } = this.props
    if (!term) return

    const contact = contacts[0]

    if (!contact || this.props.isSelected(contact)) return

    onAdd(contact)
    e.target.value = ''
  }

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

    const { onTermChange, onKeyDown } = this

    return (
      <div data-id='add-contacts-to-campaign-modal'>
        <h1 className='f-xl regular center mt6'>Add Contacts to this Campaign</h1>
        <AvatarList items={selectedContacts} onRemove={onRemove} className='my4 px4' />
        <SearchBox
          initialTerm={term}
          onTermChange={onTermChange}
          onKeyDown={onKeyDown}
          placeholder='Search or create a new contact'
          data-id='search-contacts-input'
        />
        <Scroll height={'calc(95vh - 250px)'}>
          <ContactListWithHoverDetect
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
}

class ContactSortContainer extends React.Component {
  addToCampaignSort = (a, b) => {
    const {notInCampaignSort, inMyContactsSort, updatedAtSort} = this
    let res = notInCampaignSort(a, b)
    if (res !== 0) {
      return res
    }

    res = inMyContactsSort(a, b)
    if (res !== 0) {
      return res
    }

    return updatedAtSort(a, b)
  }

  // Sort contacts not in the campaign before those already in it
  notInCampaignSort = (a, b) => {
    const {campaignContacts} = this.props
    const isA = campaignContacts.some(c => c.slug === a.slug)
    const isB = campaignContacts.some(c => c.slug === b.slug)
    if (isA && !isB) {
      return 1
    }
    if (!isA && isB) {
      return -1
    }
    return 0
  }

  // Sort contacts in myContacts before those that aren't
  inMyContactsSort = (a, b) => {
    const {myContacts} = this.props
    const aContact = myContacts.find(c => c.slug === a.slug)
    const bContact = myContacts.find(c => c.slug === b.slug)
    if (aContact && !bContact) {
      return -1
    }
    if (bContact && !aContact) {
      return 1
    }
    if (aContact && bContact) {
      return bContact.updatedAt.getTime() - aContact.updatedAt.getTime()
    }
    return 0
  }

  // Sort recently updated contacts before less recently updated ones
  updatedAtSort = (a, b) => {
    return (b.updatedAt || b.createdAt).getTime() - (a.updatedAt || a.createdAt).getTime()
  }

  render () {
    const {contacts, ...props} = this.props
    const {addToCampaignSort} = this
    contacts.sort(addToCampaignSort)
    return <AddContact {...props} contacts={contacts} />
  }
}

const SearchableAddContact = createSearchContainer(ContactSortContainer)

class AddContactContainer extends React.Component {
  static propTypes = {
    term: PropTypes.string.isRequired,
    onTermChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    campaignContacts: PropTypes.array
  }

  static defaultProps = {
    campaignContacts: []
  }

  state = {
    selectedContacts: []
  }

  // Is the contact in the campaign or in selected contacts list?
  isSelected = (contact) => {
    return this.state.selectedContacts.some((c) => c.slug === contact.slug)
  }

  // Is the contact not on the campaign already
  isSelectable = (contact) => {
    return !this.props.campaignContacts.some((c) => c.slug === contact.slug)
  }

  onAdd = (contact) => {
    this.setState({
      selectedContacts: this.state.selectedContacts.concat(contact)
    })
  }

  onSubmit = (event) => {
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
  }

  onRemove = (contact) => {
    this.setState({
      selectedContacts: this.state.selectedContacts.filter((c) => c._id !== contact._id)
    })
  }

  onReset = () => {
    this.props.onDismiss()
    this.deselectAll()
  }

  deselectAll = () => {
    this.setState({ selectedContacts: [] })
  }

  render () {
    const {
      onAdd,
      onRemove,
      onReset,
      onSubmit
    } = this

    const { selectedContacts } = this.state
    const { term, onCreate, campaignContacts, onTermChange } = this.props
    const myContacts = Meteor.user().myContacts

    // Initial suggestions should be contacts not on this campaign.
    // When searching we do include contacts on the campaign so we can let them know.
    const searchOpts = { term }
    if (!term) {
      searchOpts.excludeSlugs = campaignContacts.map(c => c.slug)
    }

    return (
      <SearchableAddContact
        {...searchOpts}
        campaignContacts={campaignContacts}
        myContacts={myContacts}
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
}

export default Modal(withSnackbar(AddContactContainer))

class ContactsList extends React.Component {
  static propTypes = {
    isSelected: PropTypes.func.isRequired,
    isSelectable: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    searching: PropTypes.bool.isRequired,
    isHoveringOver: PropTypes.bool.isRequired
  }

  onContactClick = (contact, isSelected) => {
    return isSelected ? this.props.onRemove(contact) : this.props.onAdd(contact)
  }

  render () {
    const {
      searching,
      contacts,
      isHoveringOver
    } = this.props
    return (
      <div data-id={`contacts-table-${searching ? 'search-results' : 'unfiltered'}`}>
        {contacts.map((contact, i) => {
          const isSelected = this.props.isSelected(contact)
          const isSelectable = this.props.isSelectable(contact)

          if (isSelected) {
            return <SelectedContact contact={contact} onContactClick={this.onContactClick} key={contact.slug} />
          }

          if (isSelectable) {
            return <SelectableContact contact={contact} onContactClick={this.onContactClick} key={contact.slug} hover={!isHoveringOver && i === 0} />
          }

          return <UnselectabledContact contact={contact} key={contact.slug} />
        })}
      </div>
    )
  }
}

const ContactListWithHoverDetect = MouseHoveringDetection(ContactsList)

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

const SelectableContact = ({contact, onContactClick, hover}) => {
  const campaigns = Object.keys(contact.campaigns).length

  return (
    <div className={`hover-color-trigger hover-opacity-trigger hover-bg-trigger ${hover && 'hover'}`}>
      <div className='flex items-center border-bottom border-gray80 py2 pl4 pointer hover-bg-gray90'
        onClick={() => onContactClick(contact, false)}>
        <div className='flex-auto'>
          <CampaignContact contact={contact} />
        </div>
        <div className='flex-none px4 f-sm gray40 hover-gray20'>
          {`${campaigns} ${campaigns === 1 ? 'campaign' : 'campaigns'}`}
        </div>
        <div className='flex-none px4 opacity-0 hover-opacity-100'>
          <AddIcon data-id='add-button' style={{fill: BLUE}} />
        </div>
      </div>
    </div>
  )
}

const SelectedContact = ({contact, onContactClick}) => {
  const campaigns = Object.keys(contact.campaigns).length

  return (
    <div className='flex items-center border-bottom border-gray80 py2 pl4 active pointer hover-bg-gray90 hover-color-trigger hover-opacity-trigger'
      onClick={() => onContactClick(contact, true)}>
      <div className='flex-auto'>
        <CampaignContact contact={contact} highlighted />
      </div>
      <div className='flex-none px4 f-sm gray40 hover-gray20'>
        {`${campaigns} ${campaigns === 1 ? 'campaign' : 'campaigns'}`}
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
