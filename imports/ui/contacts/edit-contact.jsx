import React, { PropTypes } from 'react'
import cloneDeep from 'lodash.clonedeep'
import ValidationBanner from '../errors/validation-banner'
import FormError from '../errors/form-error'
import EditableAvatar from '../images/editable-avatar/editable-avatar'
import { CameraIcon, FilledCircle, EmailIcon, PhoneIcon } from '../images/icons'
import Modal from '../navigation/modal'
import {SocialMap, SocialIcon} from '../social/social'
import OutletAutocomplete from './outlet-autocomplete'

const FormSection = ({label, addLinkText, onAdd, children}) => (
  <section className='pl6 pb3'>
    <label className='block gray40 semibold f-sm pt4'>{label}</label>
    <div style={{marginLeft: -32}}>
      {children}
    </div>
    <div className='mt2'>
      <span className='pointer inline-block blue f-xs underline' onClick={onAdd}>
        {addLinkText}
      </span>
    </div>
  </section>
)

const EditContact = React.createClass({
  propTypes: {
    open: PropTypes.bool,
    contact: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    // Allow some prefill data to be passed in
    prefill: PropTypes.shape({
      name: PropTypes.string
    })
  },

  getInitialState () {
    const contact = this.props.contact || {}
    // Create the full socials list, setting any existing social values.
    const socials = Object.keys(SocialMap).map((label, i) => {
      const existing = contact.socials && contact.socials.find((s) => s.label === label)
      if (existing) return Object.assign({}, existing)
      return {label, value: ''}
    })
    const state = Object.assign({
      avatar: contact.avatar || '',
      name: contact.avatar || '',
      outlets: this.atLeastOne(contact.outlets, ''),
      emails: this.atLeastOne(contact.emails, 'Email'),
      phones: this.atLeastOne(contact.phones, 'Phone'),
      socials,
      showErrors: false
    }, this.props.prefill)
    state.errors = this.validate(state)
    return state
  },

  atLeastOne (arr, label) {
    if (!arr || !arr.length) return [{ label: label, value: '' }]
    return cloneDeep(arr)
  },

  onAvatarChange (evt) {
    const avatar = evt.url
    this.setState({avatar})
  },

  onAvatarError (err) {
    console.log('onAvatarError', err)
  },

  onJobTitleChange (evt) {
    const {name, value} = evt.target
    const outlets = cloneDeep(this.state.outlets)
    outlets[name].value = value
    this.setState({outlets})
  },

  onJobOrgChange (evt) {
    const {name, value} = evt.target
    const outlets = cloneDeep(this.state.outlets)
    outlets[name].label = value
    this.setState({outlets})
  },

  onJobOrgSelect ({name, value}) {
    const outlets = cloneDeep(this.state.outlets)
    outlets[name].label = value
    this.setState({outlets})
  },

  onJobTitleSelect ({name, value}) {
    const outlets = cloneDeep(this.state.outlets)
    outlets[name].value = value
    this.setState({outlets})
  },

  onProfileChange (evt) {
    const {name, value} = evt.target
    this.setState({[name]: value})
    this.setState((s) => ({
      errors: this.validate(s)
    }))
  },

  onEmailChange (evt) {
    const {name, value} = evt.target
    const emails = cloneDeep(this.state.emails)
    emails[name].value = value
    this.setState({emails})
    this.setState((s) => ({
      errors: this.validate(s)
    }))
  },

  onPhoneChange (evt) {
    const {name, value} = evt.target
    const phones = cloneDeep(this.state.phones)
    phones[name].value = value
    this.setState({phones})
  },

  onSocialChange (evt) {
    const {name, value} = evt.target
    const socials = Array.from(this.state.socials)
    socials[name].value = value
    this.setState({socials})
  },

  onDelete (evt) {
    console.log('TODO: onDelete')
  },

  onAdd (prop, item) {
    this.setState((s) => ({
      [prop]: s[prop].concat([item])
    }))
  },

  onAddJob () {
    this.onAdd('outlets', {label: '', value: ''})
  },

  onAddEmail () {
    this.onAdd('emails', {label: 'Email', value: ''})
  },

  onAddPhone (evt) {
    this.onAdd('phones', {label: 'Phone', value: ''})
  },

  onAddSocial (evt) {
    this.onAdd('socials', {label: 'Website', value: ''})
  },

  validate ({name, emails}) {
    const errors = {}
    if (!name) errors.name = 'Please add a contact name'
    const emailRegEx = /.+@.{2,}\..{2,}/
    const emailErrors = emails.map((e, i) => {
      const {value} = e
      if (value && !value.match(emailRegEx)) return 'Looks like this isn’t a valid email'
      return false
    })
    console.log({emailErrors})
    const hasEmailErrors = Object.keys(emailErrors).length > 0
    if (hasEmailErrors) {
      errors.emails = emailErrors
    }
    if (errors.name && hasEmailErrors) {
      errors.headline = 'Let’s add a little more detail'
    } else if (errors.name) {
      errors.headline = 'Please add a contact name'
    } else if (hasEmailErrors) {
      errors.headline = 'Looks like that isn’t a valid email'
    }
    return errors
  },

  isValid (errors) {
    return Object.keys(errors) > 0
  },

  onSubmit (evt) {
    evt.preventDefault()
    const isValid = this.isValid(this.state.errors)
    console.log({isValid})
    if (!isValid) {
      return this.setState({showErrors: true})
    }
    this.props.onSubmit(cloneDeep(this.state))
  },

  inputSize (value) {
    if (!value || value.length < 11) return 12
    return value.length + 2
  },

  render () {
    const { onAvatarChange, onAvatarError, onJobTitleChange, onJobOrgChange, onJobOrgSelect, onJobTitleSelect, onAddJob, onProfileChange, onEmailChange, onAddEmail, onPhoneChange, onAddPhone, onSocialChange, onAddSocial, onSubmit, onDelete, inputSize } = this
    const { onDismiss } = this.props
    const contact = this.state
    const { avatar, outlets, emails, phones, socials, errors, showErrors } = this.state
    const iconStyle = { width: 30 }
    return (
      <div>
        <ValidationBanner show={showErrors} error={errors.headline} />
        <div style={{maxHeight: 'calc(95vh - 76px)', overflowY: 'auto'}}>
          <div className='py6 center'>
            <EditableAvatar avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuTop={-20}>
              <div className='bg-gray60 center circle mx-auto' style={{height: '110px', width: '110px', lineHeight: '110px', overflowY: 'hidden'}}>
                { avatar ? <img src={avatar} width='110' height='110' /> : <CameraIcon className='svg-icon-xl' /> }
              </div>
            </EditableAvatar>
            <div>
              <input
                className='center input-inline mt4 f-xxxl semibold'
                placeholder='Contact Name'
                type='text'
                name='name'
                value={contact.name}
                size={inputSize(contact.name)}
                onChange={onProfileChange} />
              <FormError show={showErrors} error={errors.name} className='' />
            </div>
          </div>
          <div>
            <div className='bg-gray90 border-top border-gray80'>
              <div className='mx-auto pb6' style={{maxWidth: 500}}>

                <FormSection label='Jobs' addLinkText='Add another job' onAdd={onAddJob}>
                  {outlets.map((outlet, index) => (
                    <div key={index} className='pt2'>
                      <FilledCircle style={iconStyle} className='inline-block gray60' />
                      <div className='inline-block align-middle'>
                        <OutletAutocomplete
                          style={{width: 225}}
                          menuWidth={225}
                          className='input'
                          value={outlet.value}
                          name={index}
                          field='value'
                          placeholder='Title'
                          onSelect={onJobTitleSelect}
                          onChange={onJobTitleChange}
                        />
                      </div>
                      <div className='inline-block align-middle ml4'>
                        <OutletAutocomplete
                          style={{width: 225}}
                          menuWidth={225}
                          className='input'
                          value={outlet.label}
                          name={index}
                          field='label'
                          placeholder='Outlet'
                          onSelect={onJobOrgSelect}
                          onChange={onJobOrgChange}
                        />
                      </div>
                    </div>
                  ))}
                </FormSection>

                <FormSection label='Emails' addLinkText='Add another email' onAdd={onAddEmail}>
                  {emails.map((email, index) => {
                    const error = errors.emails && errors.emails[index]
                    console.log({error})
                    return (
                      <div key={index} className='pt2'>
                        <EmailIcon style={iconStyle} className='inline-block' />
                        <div className='inline-block align-middle'>
                          <input
                            style={{width: 350}}
                            className={`input ${error && 'border-red'}`}
                            type='text'
                            value={email.value}
                            name={index}
                            onChange={onEmailChange}
                            placeholder='Email' />
                          <FormError show={showErrors} error={error} />
                        </div>
                      </div>
                    )
                  })}
                </FormSection>

                <FormSection label='Phones' addLinkText='Add another phone' onAdd={onAddPhone}>
                  {phones.map((phone, index) => (
                    <div key={index} className='pt2'>
                      <PhoneIcon style={iconStyle} className='inline-block' />
                      <div className='inline-block align-middle'>
                        <input
                          style={{width: 350}}
                          className='input'
                          type='text'
                          name={index}
                          value={phone.value}
                          onChange={onPhoneChange}
                          placeholder='Phone number' />
                      </div>
                    </div>
                  ))}
                </FormSection>

                <FormSection label='Websites & Social Links' addLinkText='Add another social' onAdd={onAddSocial}>
                  {socials.map(({label, value}, index) => (
                    <div key={index} className='pt2'>
                      <SocialIcon label={label} value={value} style={iconStyle} className='inline-block' />
                      <div className='inline-block align-middle'>
                        <input
                          style={{width: 472}}
                          className='input'
                          type='text'
                          name={index}
                          value={value}
                          onChange={onSocialChange}
                          placeholder={label} />
                      </div>
                    </div>
                  ))}
                </FormSection>

              </div>
            </div>
          </div>
        </div>
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right' onClick={onSubmit}>Save Changes</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={onDismiss}>Cancel</button>
            {this.props.contact && <button className='btn bg-transparent not-interested' onClick={onDelete}>Delete Contact</button>}
          </div>
        </div>
      </div>
    )
  }
})

const EditContactModal = Modal(EditContact)

export default EditContactModal
