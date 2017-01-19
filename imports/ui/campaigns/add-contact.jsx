import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { Link } from 'react-router'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon, RemoveIcon } from '../images/icons'
import AvatarList from '../lists/avatar-list'
import { CircleAvatar } from '../images/avatar'
import Tooltip from '../navigation/tooltip'

function truncate (str, chars) {
  if (str.length <= chars) return str
  return str.substring(0, chars) + '...'
}

const AddContact = React.createClass({
  PropTypes: {
    onSubmit: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    isActive: PropTypes.func.isRequired,
    contactsAll: PropTypes.object.isRequired,
    filteredContacts: PropTypes.array,
    selectedContacts: PropTypes.array.isRequired
  },

  render () {
    const {
      onReset,
      onSubmit,
      selectedContacts,
      filteredContacts,
      onSearch,
      onAdd,
      onRemove,
      isActive
    } = this.props

    const scrollableHeight = Math.max(window.innerHeight - 380, 80)

    return (
      <div>
        <h1 className='f-xl regular center mt6'>Add Contacts to this Campaign</h1>
        <AvatarList items={selectedContacts} onRemove={onRemove} className='my4 px4' />
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder='Find a contact...' onChange={onSearch} style={{outline: 'none'}} />
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
          <ContactsList
            isActive={isActive}
            onAdd={onAdd}
            onRemove={onRemove}
            contacts={filteredContacts} />
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

const ContactsList = React.createClass({
  propTypes: {
    isActive: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
  },

  onClick (contact, isActive) {
    const { onAdd, onRemove } = this.props
    return isActive ? onRemove(contact) : onAdd(contact)
  },

  render () {
    const { contacts } = this.props

    return (
      <div>
        {contacts.map((contact) => {
          const isActive = this.props.isActive(contact)
          const {
            slug,
            avatar,
            name,
            outlets,
            medialists
          } = contact
          return (
            <div className={`flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger ${isActive ? 'active' : ''}`} key={slug} onClick={() => this.onClick(contact, isActive)}>
              <CircleAvatar avatar={avatar} name={name} />
              <div className='inline-block pl4' style={{width: '24rem'}}>
                <span className='f-xl gray40 py1'>{name}</span><br />
                <span className='gray60 py1'>{(outlets && outlets.length) ? outlets[0].value : null}</span><br />
                <span className='gray60 py1'>{truncate(outlets.map((o) => o.label).join(', '), 30)}</span>
              </div>
              <div className='flex-none px4'>{medialists.length} campaigns</div>
              <div className={`flex-none pl4 pr2 ${isActive ? '' : 'opacity-0'} hover-opacity-100`}>
                {isActive ? <SelectedIcon /> : <AddIcon />}
              </div>
              <div className={`flex-none pl2 pr4 ${isActive ? 'hover-opacity-100' : 'opacity-0'} gray20 hover-fill-trigger`}>
                {isActive ? <Tooltip title='Remove'><RemoveIcon /></Tooltip> : <RemoveIcon />}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})
