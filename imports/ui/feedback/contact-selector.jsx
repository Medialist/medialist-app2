import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
import { CircleAvatar } from '/imports/ui/images/avatar'
import { ChevronDown } from '/imports/ui/images/icons'
import StatusSelector from '/imports/ui/feedback/status-selector'
import ContactFilterableList from '/imports/ui/contacts/contact-filterable-list'
import StatusLabel from '/imports/ui/feedback/status-label'

const ContactButton = (props) => {
  const { name, avatar } = props.contact
  return (
    <div style={{marginTop: '-1px'}} className='align-left'>
      <CircleAvatar size={20} avatar={avatar} name={name} />
      <div className='inline-block ml2 align-middle f-sm normal gray10'>{name}</div>
      <ChevronDown className='ml1 gray40' />
    </div>
  )
}

class ContactSelector extends React.Component {
  static propTypes = {
    isEdit: PropTypes.bool,
    selectedContact: PropTypes.object,
    selectedStatus: PropTypes.string,
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    showStatus: PropTypes.bool.isRequired,
    onContactChange: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    onOpen: PropTypes.func,
    onClose: PropTypes.func
  }

  static defaultProps = {
    isEdit: false,
    showStatus: true,
    contacts: []
  }

  state = {
    open: false,
    term: ''
  }

  openDropdown = () => {
    this.setState({
      open: true
    })

    if (this.props.onOpen) {
      this.props.onOpen()
    }
  }

  closeDropdown = () => {
    this.setState({
      open: false,
      term: ''
    })

    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  onSelectContact = (contact) => {
    this.setState({
      open: false,
      term: ''
    })

    this.props.onContactChange({
      target: {
        name: 'contact',
        value: contact
      }
    })

    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  onStatusChange = (event) => {
    this.props.onStatusChange(event)
  }

  onTermChange = (term) => {
    this.setState({ term })
  }

  render () {
    const { onSelectContact, onStatusChange, closeDropdown, onTermChange } = this
    const { selectedContact, selectedStatus, contacts, campaign, showStatus, isEdit } = this.props
    const { open, term } = this.state
    const filteredContacts = contacts.filter((contact) => contactMatchesTerm(contact, term))
    return (
      <div className='inline-block'>
        <div className='inline-block'>
          <Dropdown>
            <button
              className='btn bg-transparent border-gray80'
              style={{height: 34, padding: '0 12px', borderRadius: 2}}
              onClick={this.openDropdown} disabled={isEdit || !contacts.length}
              data-id='select-contact-button'>
              { selectedContact ? <ContactButton contact={selectedContact} /> : 'Select a Contact' }
            </button>
            <DropdownMenu width={573} left={-50} arrowAlign='left' arrowMarginLeft='100px' open={open} onDismiss={closeDropdown}>
              <ContactFilterableList
                term={term}
                onTermChange={onTermChange}
                campaign={campaign}
                contacts={filteredContacts}
                onSelectContact={onSelectContact} />
            </DropdownMenu>
          </Dropdown>
        </div>
        {showStatus && selectedContact ? (
          <div className='ml1 inline-block'>
            <StatusSelector
              buttonStyle={{padding: '6px 15px 7px'}}
              status={selectedStatus}
              onChange={onStatusChange}
              disabled={isEdit || !selectedContact} >
              <StatusLabel name={selectedStatus} />
            </StatusSelector>
          </div>
        ) : null}
      </div>
    )
  }
}

export default ContactSelector

const contactMatchesTerm = (contact, term) => {
  term = term.toLowerCase()
  const { name, outlets } = contact

  if (name.toLowerCase().substring(0, term.length) === term) {
    return contact
  }

  if (outlets.some((outlet) => {
    return [outlet.label, outlet.value]
      .map((name) => name.toLowerCase().replace('the ', '').substring(0, term.length))
      .some((name) => name === term)
  })) {
    return contact
  }

  return null
}
