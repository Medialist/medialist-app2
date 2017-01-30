import React, { PropTypes } from 'react'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { CircleAvatar } from '../images/avatar.jsx'
import { ChevronDown } from '../images/icons'
import CampaignContacts from '../campaigns/campaign-contacts'
import StatusSelector from '../feedback/status-selector'

const ContactButton = (props) => {
  const { name, avatar } = props.contact
  return (
    <div style={{marginTop: '-1px'}} className='align-left'>
      <CircleAvatar size={20} avatar={avatar} name={name} />
      <div className='inline-block ml2 align-middle f-sm normal gray10'>{name}</div>
      <ChevronDown className='ml1 gray40' style={{verticalAlign: 'bottom'}} />
    </div>
  )
}

const ContactSelector = React.createClass({
  propTypes: {
    selectedContact: PropTypes.object,
    selectedStatus: PropTypes.string,
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    showStatus: PropTypes.bool.isRequired,
    onContactChange: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired
  },
  getDefaultProps () {
    return { showStatus: true }
  },
  getInitialState () {
    return { open: false }
  },
  openDropdown () {
    this.setState({open: true})
  },
  closeDropdown () {
    this.setState({open: false})
  },
  onSelectContact (contact) {
    this.setState({open: false})
    this.props.onContactChange(contact)
  },
  onStatusChange (status) {
    this.props.onStatusChange(status)
  },
  render () {
    const { onSelectContact, onStatusChange } = this
    const { selectedContact, selectedStatus, contacts, campaign, showStatus } = this.props

    return (
      <div>
        <div className='inline-block'>
          <Dropdown>
            <button className='btn bg-transparent border-gray80' style={{height: 34, padding: '0 12px', borderRadius: 2}} onClick={this.openDropdown} disabled={!contacts || !contacts.length}>
              { selectedContact ? <ContactButton contact={selectedContact} /> : 'Select a Contact' }
            </button>
            <DropdownMenu width={520} left={-50} open={this.state.open} onDismiss={this.closeDropdown}>
              <CampaignContacts campaign={campaign} contacts={contacts} onSelectContact={onSelectContact} />
            </DropdownMenu>
          </Dropdown>
        </div>
        {showStatus
          ? <StatusSelector
            status={selectedStatus}
            border
            chevron
            onChange={onStatusChange}
            disabled={!selectedContact} />
          : null}
      </div>
    )
  }
})

export default ContactSelector
