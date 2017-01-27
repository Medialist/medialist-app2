import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { Link } from 'react-router'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon, RemoveIcon } from '../images/icons'
import AvatarList from '../lists/avatar-list'
import Tooltip from '../navigation/tooltip'
import CampaignContact from './campaign-contact.jsx'

const AddContact = React.createClass({
  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired, // Add to campaign
    onRemove: PropTypes.func.isRequired, // Remove from campaign/selection
    onCreate: PropTypes.func.isRequired, // Create new contact
    onSearch: PropTypes.func.isRequired,
    isActive: PropTypes.func.isRequired,
    contactsAll: PropTypes.array.isRequired,
    filteredContacts: PropTypes.array,
    selectedContacts: PropTypes.array.isRequired
  },

  getInitialState () {
    return { term: '' }
  },

  onChange (e) {
    this.setState({ term: e.target.value })
    this.props.onSearch(e.target.value)
  },

  onKeyPress (e) {
    if (e.key !== 'Enter') return
    if (!this.state.term) return

    const { isActive, filteredContacts, onAdd } = this.props
    const contact = filteredContacts[0]

    if (!contact || isActive(contact)) return

    onAdd(contact)
    this.setState({ term: '' })
  },

  render () {
    const {
      onReset,
      onSubmit,
      selectedContacts,
      filteredContacts,
      onAdd,
      onRemove,
      onCreate,
      isActive
    } = this.props
    const { term } = this.state
    const { onChange, onKeyPress } = this

    const scrollableHeight = Math.max(window.innerHeight - 380, 80)

    return (
      <div>
        <h1 className='f-xl regular center mt6'>Add Contacts to this Campaign</h1>
        <AvatarList items={selectedContacts} onRemove={onRemove} className='my4 px4' />
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder='Find a contact...' onChange={onChange} style={{outline: 'none'}} onKeyPress={onKeyPress} value={term} />
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
          <ContactsList
            isActive={isActive}
            onAdd={onAdd}
            onRemove={onRemove}
            onCreate={onCreate}
            contacts={filteredContacts}
            term={term} />
        </div>
        <form className='py4 border-top border-gray80 flex' onReset={onReset} onSubmit={onSubmit}>
          <div className='flex-auto'>
            <Link to={'/contacts/import'} className='btn bg-transparent blue ml1'>
              Import Contacts via CSV
            </Link>
          </div>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' type='reset'>Cancel</button>
            <button className='btn bg-completed white px3 mr4' type='submit'>Save Changes</button>
          </div>
        </form>
      </div>
    )
  }
})

const AddContactContainer = React.createClass({
  propTypes: {
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    contactsAll: PropTypes.array.isRequired,
    contacts: PropTypes.array.isRequired // (Campaign contacts)
  },

  getInitialState () {
    return {
      selectedContacts: [],
      filteredContacts: this.props && this.props.contactsAll || []
    }
  },

  // Is the contact in the campaign or in selected contacts list?
  isActive (contact) {
    const { contacts } = this.props
    const { selectedContacts } = this.state
    const activeContacts = contacts.concat(selectedContacts)
    return activeContacts.some((c) => c._id === contact._id)
  },

  onAdd (contact) {
    let { selectedContacts } = this.state
    selectedContacts = selectedContacts.concat(contact)
    this.setState({ selectedContacts })
  },

  onSubmit (evt) {
    evt.preventDefault()
    const contactSlugs = this.state.selectedContacts.map((c) => c.slug)
    const campaignSlug = this.props.campaign.slug
    if (contactSlugs.length > 0) Meteor.call('contacts/addToMedialist', contactSlugs, campaignSlug)
    this.onReset()
  },

  onRemove (contact) {
    let { selectedContacts } = this.state

    if (selectedContacts.some((c) => c._id === contact._id)) {
      selectedContacts = selectedContacts.filter((c) => c._id !== contact._id)
      this.setState({ selectedContacts })
    } else {
      Meteor.call('contacts/removeFromMedialist', contact.slug, this.props.campaign.slug)
    }
  },

  onReset () {
    this.props.onDismiss()
    this.deselectAll()
  },

  onSearch (term) {
    const query = {name: {$regex: `^${term}`, $options: 'i'}}
    const filteredContacts = window.Contacts.find(query, {limit: 20, sort: {name: 1}}).fetch()
    this.setState({filteredContacts})
  },

  deselectAll () {
    this.setState({selectedContacts: []})
  },

  render () {
    const props = Object.assign({}, this, this.state, this.props)
    return <AddContact {...props} />
  }
})

export default Modal(AddContactContainer)

const ContactsList = React.createClass({
  propTypes: {
    isActive: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    term: PropTypes.string
  },

  onContactClick (contact, isActive) {
    const { onAdd, onRemove } = this.props
    return isActive ? onRemove(contact) : onAdd(contact)
  },

  onCreateClick () {
    this.props.onCreate({ name: this.props.term })
  },

  render () {
    const { contacts, term } = this.props
    const { onContactClick, onCreateClick } = this

    let items = contacts.map((contact) => {
      const isActive = this.props.isActive(contact)
      const {slug, medialists} = contact
      return (
        <div
          className={`flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger hover-color-trigger ${isActive ? 'active' : ''}`}
          key={slug}
          onClick={() => onContactClick(contact, isActive)}>
          <div className='flex-auto'>
            <CampaignContact contact={contact} />
          </div>
          <div className='flex-none px4 f-sm gray40 hover-gray20'>
            {medialists.length} {medialists.length === 1 ? 'campaign' : 'campaigns'}
          </div>
          <div className={`flex-none pl4 pr2 ${isActive ? '' : 'opacity-0'} hover-opacity-100`}>
            {isActive ? <SelectedIcon /> : <AddIcon />}
          </div>
          <div className={`flex-none pl2 pr4 ${isActive ? 'hover-opacity-100' : 'opacity-0'} gray20 hover-fill-trigger`}>
            {isActive ? <Tooltip title='Remove'><RemoveIcon /></Tooltip> : <RemoveIcon />}
          </div>
        </div>
      )
    })

    if (term) {
      items = items.concat(
        <div key='createContact' className='p4 center'>
          <button type='button' className='btn bg-blue white' onClick={onCreateClick}>Create new Contact "{term}"</button>
        </div>
      )
    }

    return <div>{items}</div>
  }
})
