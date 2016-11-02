import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import cloneDeep from 'lodash.clonedeep'
import { CircleAvatar } from '../images/avatar'
import { EmailIcon, PhoneIcon, AddressIcon } from '../images/icons'

const EditContactContainer = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    contact: PropTypes.object,
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

  onChange (change) {
    this.setState(change)
  },

  onSubmit () {
    this.props.onSubmit(this.state)
    // nuke the state
    this.setState(this.getInitialState())
  },

  onDismiss () {
    this.props.onDismiss()
    // nuke the state
    this.setState(this.getInitialState())
  },

  render () {
    const { open } = this.props
    const contact = this.state
    return <EditContact onSubmit={this.onSubmit} onDismiss={this.onDismiss} onChange={this.onChange} contact={contact} open={open} />
  }
})

const EditContact = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    contact: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  onProfileChange (evt) {
    const {name, value} = evt.target
    this.props.onChange({[name]: value})
  },

  onEmailChange (evt) {
    const {name, value} = evt.target
    const emails = cloneDeep(this.props.contact.emails)
    emails[name].value = value
    this.props.onChange({emails})
  },

  onAddEmail () {
    const emails = Array.from(this.props.contact.emails)
    emails.push({label: 'Email', value: ''})
    this.props.onChange({emails})
  },

  onPhoneChange (evt) {
    const {name, value} = evt.target
    const phones = cloneDeep(this.props.contact.phones)
    phones[name].value = value
    this.props.onChange({phones})
  },

  onAddPhone (evt) {
    const phones = Array.from(this.props.contact.phones)
    phones.push({label: 'Phone', value: ''})
    this.props.onChange({phones})
  },

  onSocialChange (evt) {
    const {name, value} = evt.target
    const socials = Array.from(this.props.contact.socials)
    socials[name].value = value
    this.props.onChange({socials})
  },

  onAddSocial (evt) {
    const socials = Array.from(this.props.contact.socials)
    socials.push({label: 'Social', value: ''})
    this.props.onChange({socials})
  },

  onAddressChange (evt) {
    console.log('TODO: onAddressChange')
  },

  onDelete (evt) {
    console.log('TODO: onDelete')
  },

  onSubmit (evt) {
    evt.preventDefault()
    this.props.onSubmit()
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
    const { open, onDismiss, contact } = this.props
    if (!open) return null
    const emails = this.atLeastOne(contact.emails, 'Email')
    const phones = this.atLeastOne(contact.phones, 'Phone')
    const socials = this.atLeastOne(contact.socials, 'Social')
    // TODO: migrate address format. Currently is a string.
    const { onProfileChange, onEmailChange, onAddEmail, onPhoneChange, onAddPhone, onSocialChange, onAddSocial, onAddressChange, onSubmit, onDelete, inputSize } = this
    const scrollableHeight = window.innerHeight - 380
    const inputWidth = 270
    const iconWidth = 30
    const inputStyle = { width: inputWidth }
    const iconStyle = { width: iconWidth }
    const linkStyle = { marginLeft: iconWidth }
    // Prevent scrolling of the page when modal is open. Modal has internal scrollable section
    const htmlStyle = open ? 'height:100%; overflow:hidden' : ''
    return (
      <div>
        <Helmet htmlAttributes={{ style: htmlStyle }} />
        <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={onDismiss} />
        <div className='absolute top-0 right-0 left-0 bg-white fit mx-auto' style={{width: 675}}>
          <div className='inline-block right pointer f-xxl mx2 gray60 hover-blue' onClick={onDismiss}>&times;</div>
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
      </div>
    )
  }
})

export default EditContactContainer
