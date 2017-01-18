import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import { SquareAvatar } from '../images/avatar.jsx'
import { dropdownMenuStyle } from '../common-styles'
import CampaignContacts from '../campaigns/campaign-contacts'
import StatusSelector from '../feedback/status-selector'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { width: 520 })

const ContactButton = (props) => {
  const { name, avatar } = props.contact
  return (
    <div style={{margin: '-1px 0 -1px -4px'}} className='align-left'>
      <SquareAvatar size={20} avatar={avatar} name={name} />
      <div className='inline-block ml2 align-middle f-sm normal gray10'>{name}</div>
    </div>
  )
}

const ContactSelector = React.createClass({
  propTypes: {
    selectedContact: PropTypes.object,
    selectedStatus: PropTypes.string,
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    onContactChange: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired
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
    const { selectedContact, selectedStatus, contacts, campaign } = this.props

    return (
      <div>
        <div className='inline-block'>
          <Dropdown>
            <button className='btn bg-transparent border-gray80 mx2' onClick={this.openDropdown} disabled={!contacts || !contacts.length}>
              { selectedContact ? <ContactButton contact={selectedContact} /> : 'Select a Contact' }
            </button>
            <DropdownMenu right style={dropdownStyle} open={this.state.open} onDismiss={this.closeDropdown}>
              <CampaignContacts campaign={campaign} contacts={contacts} onSelectContact={onSelectContact} />
            </DropdownMenu>
          </Dropdown>
        </div>
        <StatusSelector status={selectedStatus} border onChange={onStatusChange} disabled={!selectedContact} />
      </div>
    )
  }
})

export default ContactSelector
