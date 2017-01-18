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
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
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
  onLinkClick (contact) {
    this.setState({open: false})
    this.props.onChange(contact)
  },
  onStatusChange (status) {
    console.log({ status })
  },
  render () {
    const { onStatusChange } = this
    const { selectedContact, contacts, campaign } = this.props
    const status = selectedContact && campaign.contacts[selectedContact.slug]

    return (
      <div className='inline-block'>
        <Dropdown>
          <button className='btn bg-transparent border-gray80 mx2' onClick={this.openDropdown} disabled={!contacts || !contacts.length}>
            { selectedContact ? <ContactButton contact={selectedContact} /> : 'Select a Contact' }
          </button>
          <StatusSelector status={status} border onChange={onStatusChange} />
          <DropdownMenu right style={dropdownStyle} open={this.state.open} onDismiss={this.closeDropdown}>
            <CampaignContacts campaign={campaign} contacts={contacts} onStatusChange={({status, contact}) => console.log('ok ContactSelector got', {status, contact})} />
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
})

export default ContactSelector
