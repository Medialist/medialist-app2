import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon } from '../images/icons'
import { CircleAvatar } from '../images/avatar'
import StatusSelector from '../feedback/status-selector'

const AddContact = React.createClass({
  PropTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    deselectAll: PropTypes.func.isRequired,
    contactsAll: PropTypes.object.isRequired,
    selectedContacts: PropTypes.array.isRequired,
    contacts: PropTypes.array.isRequired,
    campaign: PropTypes.object.isRequired
  },
  getInitialState () {
    return { tabLeft: true }
  },
  toggleTab () {
    if (this.state.tabLeft) this.props.deselectAll()
    this.setState({tabLeft: !this.state.tabLeft})
  },
  isActive (slug) {
    return this.props.selectedContacts.indexOf(slug) < 0 ? '' : 'active'
  },
  selectContacts (contact) {
    const isActive = this.isActive
    const onSelect = this.props.onSelect
    const properties = Object.assign({}, contact, {isActive}, {onSelect})
    return selectFragment(properties)
  },
  campaignContacts (contact) {
    const { slug } = contact
    const status = this.props.campaign.contacts[slug]
    const onStatusChange = this.props.onStatusChange
    const properties = Object.assign({}, contact, {status}, {onStatusChange})
    return contactFragment(properties)
  },
  render () {
    const {
      toggleTab,
      selectContacts,
      campaignContacts
    } = this
    const { tabLeft } = this.state
    const {
      onReset,
      onSubmit,
      contactsAll,
      contacts
    } = this.props

    const scrollableHeight = window.innerHeight - 380

    return (
      <div>
        <div className='center'>
          <span className={`inline-block pointer f-xl pt6 pb4 mr3 gray60 active-blue active-border-bottom-blue ${tabLeft ? 'active' : ''}`} onClick={toggleTab}>Add Contacts</span>
          <span className={`inline-block pointer f-xl pt6 pb4 ml3 gray60 active-blue active-border-bottom-blue ${tabLeft ? '' : 'active'}`} onClick={toggleTab}>Campaign's Contacts</span>
        </div>
        <div className='center border-top border-bottom border-gray80 bg-gray90 py2 gray60 caps f-xxs shadow-inset'>
          {contactsAll.length} contacts total
        </div>
        <div className='py3 pl3 flex'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder='Find a contact...' />
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
          {tabLeft ? (contactsAll.map(selectContacts)) : (contacts.map(campaignContacts))}
        </div>
        <form className='p4 right' onReset={onReset} onSubmit={onSubmit}>
          <button className='btn bg-completed white right px3' type='submit'>Save Changes</button>
          <button className='btn bg-transparent gray40 right mr2' type='reset'>Cancel</button>
        </form>
      </div>
    )
  }
})

const AddContactContainer = React.createClass({
  PropTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    contactsAll: PropTypes.object.isRequired,
    contacts: PropTypes.object.isRequired
  },
  getInitialState () {
    return { selectedContacts: [] }
  },
  onStatusChange ({ status, contact }) {
    const post = {
      contactSlug: contact.slug,
      medialistSlug: this.props.campaign.slug,
      status
    }
    Meteor.call('posts/create', post)
  },
  onSelect (slug) {
    const contacts = this.state.selectedContacts.slice(0)
    contacts.indexOf(slug) < 0 ? contacts.push(slug) : contacts.splice(contacts.indexOf(slug), 1)
    this.setState({selectedContacts: contacts})
  },
  onSubmit (evt) {
    evt.preventDefault()
    const slugs = this.state.selectedContacts
    const campaign = this.props.campaign.slug
    if (slugs.length > 0) Meteor.call('contacts/addToMedialist', slugs, campaign)
    this.onReset()
  },
  onReset () {
    this.props.onDismiss()
    this.deselectAll()
  },
  deselectAll () {
    this.setState({selectedContacts: []})
  },
  render () {
    const { onReset, onSelect, onSubmit, onStatusChange, deselectAll } = this
    const { selectedContacts } = this.state
    const { onDismiss, open, contactsAll, contacts, campaign } = this.props
    const props = Object.assign({}, {
      onReset,
      onStatusChange,
      deselectAll,
      onSelect,
      onSubmit,
      selectedContacts,
      contacts,
      contactsAll,
      campaign,
      onDismiss,
      open
    })
    return <AddContact {...props} />
  }
})

export default Modal(AddContactContainer)

function selectFragment (properties) {
  const {
    isActive,
    slug,
    onSelect,
    avatar,
    name,
    jobTitles,
    primaryOutlets,
    medialists
  } = properties

  return (<div className={`flex items-center pointer border-top border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger active-bg-green-light ${isActive(slug)}`} key={slug} onClick={onSelect.bind(null, slug)}>
    <CircleAvatar avatar={avatar} />
    <div className='inline-block pl4' style={{width: '24rem'}}>
      <span className='f-xl gray40 py1'>{name}</span><br />
      <span className='gray60 py1'>{jobTitles}</span><br />
      <span className='gray60 py1'>{primaryOutlets.substring(0, 30)}...</span>
    </div>
    <div className='flex-none px4'>{medialists.length} campaigns</div>
    <div className={`flex-none px4 ${isActive(slug) ? '' : 'opacity-0'} hover-opacity-100`}>
      {isActive(slug) ? <SelectedIcon /> : <AddIcon />}
    </div>
  </div>)
}

function contactFragment (properties) {
  const {
    slug,
    avatar,
    name,
    jobTitles,
    primaryOutlets,
    status,
    onStatusChange,
    contact
  } = properties

  return (
    <div className={`flex items-center pointer border-top border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger active-bg-green-light`} key={slug}>
      <CircleAvatar avatar={avatar} />
      <div className='inline-block pl4' style={{width: '24rem'}}>
        <span className='f-xl gray40 py1'>{name}</span><br />
        <span className='gray60 py1'>{jobTitles}</span><br />
        <span className='gray60 py1'>{primaryOutlets.substring(0, 30)}...</span>
      </div>
      <div className='flex-none px4'>
        <StatusSelector status={status} onChange={(status) => onStatusChange({status, contact})} />
      </div>
    </div>
  )
}
