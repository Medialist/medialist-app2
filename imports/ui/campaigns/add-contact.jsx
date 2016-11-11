import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon, RemoveIcon } from '../images/icons'
import { CircleAvatar } from '../images/avatar'
import StatusSelector from '../feedback/status-selector'

const AddContact = React.createClass({
  PropTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    deselectAll: PropTypes.func.isRequired,
    contactsAll: PropTypes.object.isRequired,
    filteredContacts: PropTypes.array,
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
  render () {
    const {
      toggleTab,
      isActive
    } = this
    const { tabLeft } = this.state
    const {
      onReset,
      onSubmit,
      filteredContacts,
      contacts,
      onSearch,
      onSelect,
      onRemove,
      onStatusChange,
      campaign
    } = this.props

    const scrollableHeight = window.innerHeight - 380

    return (
      <div>
        <div className='center'>
          <span className={`inline-block pointer f-xl pt6 pb4 mr3 gray60 active-blue active-border-bottom-blue ${tabLeft ? 'active' : ''}`} onClick={toggleTab}>Add Contacts</span>
          <span className={`inline-block pointer f-xl pt6 pb4 ml3 gray60 active-blue active-border-bottom-blue ${tabLeft ? '' : 'active'}`} onClick={toggleTab}>Campaign's Contacts</span>
        </div>
        <div className='center border-top border-bottom border-gray80 bg-gray90 py2 gray60 caps f-xxs shadow-inset'>
          {filteredContacts.length} contacts total
        </div>
        <div className='py3 pl3 flex'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder={tabLeft ? 'Find a contact...' : 'Search campaign\'s contacts...'} onChange={onSearch} style={{outline: 'none'}} />
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
          {tabLeft ? (
            <AllContacts
              isActive={isActive}
              onSelect={onSelect}
              contacts={filteredContacts}
              />
          ) : (
            <CampaignContacts
              contacts={contacts}
              onStatusChange={onStatusChange}
              onRemove={onRemove}
              campaign={campaign} />
          )}
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
    return {
      selectedContacts: [],
      filteredContacts: this.props && this.props.contactsAll || []
    }
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
  onRemove (contact) {
    Meteor.call('contacts/removeFromMedialist', contact.slug, this.props.campaign.slug)
  },
  onReset () {
    this.props.onDismiss()
    this.deselectAll()
  },
  onSearch (evt) {
    const term = evt.target.value
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

const AllContacts = (props) => {
  const {
    isActive,
    onSelect,
    contacts
  } = props

  return (
    <div>
      {contacts.map((contact) => {
        const {
          slug,
          avatar,
          name,
          jobTitles,
          primaryOutlets,
          medialists
        } = contact
        return (
          <div className={`flex items-center pointer border-top border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger active-bg-green-light ${isActive(slug)}`} key={slug} onClick={onSelect.bind(null, slug)}>
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
          </div>
        )
      })
      }
    </div>)
}

const CampaignContacts = (props) => {
  const {
    campaign,
    onStatusChange,
    onRemove,
    contacts
  } = props

  return (
    <div>
      {contacts.map((contact) => {
        const {
          slug,
          avatar,
          name,
          jobTitles,
          primaryOutlets
        } = contact
        const status = campaign.contacts[slug]
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
            <div className='flex-auto mr2'>
              <RemoveIcon className='right pr4' onClick={(evt) => onRemove(contact)} />
            </div>
          </div>)
      })}
    </div>
  )
}
