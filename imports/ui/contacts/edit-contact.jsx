import React, { PropTypes } from 'react'
import cloneDeep from 'lodash.clonedeep'
import { CircleAvatar } from '../images/avatar'
import { EmailIcon, PhoneIcon, AddressIcon } from '../images/icons'
import Modal from '../navigation/modal'

const EditContact = React.createClass({
  propTypes: {
    open: PropTypes.bool,
    contact: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  getInitialState () {
    return cloneDeep(this.props.contact) || {
      avatar: '',
      name: '',
      jobTitles: '',
      outlets: '',
      emails: [],
      phones: [],
      socials: []
    }
  },

  onProfileChange (evt) {
    const {name, value} = evt.target
    this.setState({[name]: value})
  },

  onEmailChange (evt) {
    const {name, value} = evt.target
    const emails = cloneDeep(this.state.emails)
    emails[name].value = value
    this.setState({emails})
  },

  onAddEmail () {
    const emails = Array.from(this.state.emails)
    emails.push({label: 'Email', value: ''})
    this.setState({emails})
  },

  onPhoneChange (evt) {
    const {name, value} = evt.target
    const phones = cloneDeep(this.state.phones)
    phones[name].value = value
    this.setState({phones})
  },

  onAddPhone (evt) {
    const phones = Array.from(this.state.phones)
    phones.push({label: 'Phone', value: ''})
    this.setState({phones})
  },

  onSocialChange (evt) {
    const {name, value} = evt.target
    const socials = Array.from(this.state.socials)
    socials[name].value = value
    this.setState({socials})
  },

  onAddSocial (evt) {
    const socials = Array.from(this.state.socials)
    socials.push({label: 'Social', value: ''})
    this.setState({socials})
  },

  onAddressChange (evt) {
    console.log('TODO: onAddressChange')
  },

  onDelete (evt) {
    console.log('TODO: onDelete')
  },

  onSubmit (evt) {
    evt.preventDefault()
    this.props.onSubmit(this.state)
  },

  inputSize (value) {
    if (!value || value.length < 11) return 12
    return value.length + 2
  },

  atLeastOne (arr, label) {
    if (!arr || !arr.length) return [{ label: label, value: '' }]
    return arr
  },

  render () {
    const { onProfileChange, onEmailChange, onAddEmail, onPhoneChange, onAddPhone, onSocialChange, onAddSocial, onAddressChange, onSubmit, onDelete, inputSize } = this
    const { onDismiss } = this.props
    const contact = this.state
    // TODO: migrate contact address format. Currently is a string.
    const emails = this.atLeastOne(contact.emails, 'Email')
    const phones = this.atLeastOne(contact.phones, 'Phone')
    const socials = this.atLeastOne(contact.socials, 'Social')
    const scrollableHeight = window.innerHeight - 380
    const inputWidth = 270
    const iconWidth = 30
    const inputStyle = { width: inputWidth }
    const iconStyle = { width: iconWidth }
    const linkStyle = { marginLeft: iconWidth }
    return (
      <div>
        <div className='py6 center'>
          <CircleAvatar size={110} avatar={contact.avatar} name={contact.name} />
          <div>
            <input
              className='center input-inline mt4 f-xxl semibold'
              placeholder='Contact Name'
              type='text'
              name='name'
              value={contact.name}
              size={inputSize(contact.name)}
              onChange={onProfileChange} />
          </div>
          <div>
            <input
              className='center input-inline mt1 f-lg gray10'
              placeholder='Title'
              type='text'
              name='jobTitles'
              value={contact.jobTitles}
              size={inputSize(contact.jobTitles)}
              onChange={onProfileChange} />
          </div>
          <div>
            <input
              className='center input-inline mt1 f-lg gray10'
              placeholder='Outlets'
              type='text'
              name='primaryOutlets'
              value={contact.primaryOutlets}
              size={inputSize(contact.primaryOutlets)}
              onChange={onProfileChange} />
          </div>
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
          <div className='bg-gray90 border-top border-gray80'>
            <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Details</label>
            <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
              {emails.map((email, index) => (
                <div key={index} className='pt3'>
                  <EmailIcon style={iconStyle} className='inline-block' />
                  <div className='inline-block align-middle'>
                    <input
                      style={inputStyle}
                      className='input'
                      type='text'
                      value={email.value}
                      name={index}
                      onChange={onEmailChange}
                      placeholder='Email' />
                  </div>
                </div>
              ))}
              <div className='py2' style={linkStyle}>
                <span className='pointer inline-block blue f-xs underline' onClick={onAddEmail}>Add new email</span>
              </div>
              {phones.map((phone, index) => (
                <div key={index} className='pt3'>
                  <PhoneIcon style={iconStyle} className='inline-block' />
                  <div className='inline-block align-middle'>
                    <input
                      style={inputStyle}
                      className='input'
                      type='text'
                      value={phone.value}
                      onChange={onPhoneChange}
                      placeholder='Phone number' />
                  </div>
                </div>
              ))}
              <div className='py2' style={linkStyle}>
                <span className='pointer inline-block blue f-xs underline' onClick={onAddPhone}>Add new phone number</span>
              </div>
            </div>
          </div>
          <div className='bg-gray90 border-top border-gray80'>
            <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Social</label>
            <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
              {socials.map((social, index) => (
                <div key={index} className='pt3'>
                  <EmailIcon style={iconStyle} className='inline-block' />
                  <div className='inline-block align-middle'>
                    <input
                      style={inputStyle}
                      className='input'
                      type='text'
                      name={index}
                      value={social.value}
                      onChange={onSocialChange}
                      placeholder='Enter social or website url' />
                  </div>
                </div>
              ))}
              <div className='py2' style={linkStyle}>
                <span className='pointer inline-block blue f-xs underline' onClick={onAddSocial}>Add new social or website</span>
              </div>
            </div>
          </div>
          <div className='bg-gray90 border-top border-gray80 pb6'>
            <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Address</label>
            <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
              <div className='pt3'>
                <AddressIcon style={iconStyle} className='inline-block' />
                <div className='inline-block align-middle'>
                  <input
                    style={inputStyle}
                    className='input'
                    type='text'
                    name='street'
                    onChange={onAddressChange}
                    placeholder='Street' />
                </div>
              </div>
              <div className='pt3'>
                <AddressIcon style={iconStyle} className='inline-block invisible' />
                <div className='inline-block align-middle'>
                  <input
                    style={inputStyle}
                    className='input'
                    type='text'
                    name='city'
                    onChange={onAddressChange}
                    placeholder='City' />
                </div>
              </div>
              <div className='pt3'>
                <AddressIcon style={iconStyle} className='inline-block invisible' />
                <div className='inline-block align-middle'>
                  <input
                    style={inputStyle}
                    className='input'
                    type='text'
                    name='postcode'
                    onChange={onAddressChange}
                    placeholder='Postcode' />
                </div>
              </div>
              <div className='pt3'>
                <AddressIcon style={iconStyle} className='inline-block invisible' />
                <div className='inline-block align-middle'>
                  <input
                    style={inputStyle}
                    className='input'
                    type='text'
                    name='country'
                    onChange={onAddressChange}
                    placeholder='Country' />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='p4 bg-white'>
          <button className='btn bg-completed white right' onClick={onSubmit}>Save Changes</button>
          <button className='btn bg-transparent gray40 right mr2' onClick={onDismiss}>Cancel</button>
          <button className='btn bg-transparent not-interested' onClick={onDelete}>Delete Contact</button>
        </div>
      </div>
    )
  }
})

const EditContactModal = Modal(EditContact)

export default EditContactModal
