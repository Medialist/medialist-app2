import React, { PropTypes } from 'react'
import cloneDeep from 'lodash.clonedeep'
import { ContactCreateSchema } from '/imports/api/contacts/contacts'
import ValidationBanner from '../forms/validation-banner'
import FormError from '../forms/form-error'
import FormSection from '../forms/form-section'
import OutletAutocomplete from '../forms/outlet-autocomplete'
import { CameraIcon, FilledCircle, EmailIcon, PhoneIcon } from '../images/icons'
import { SocialMap, SocialIcon } from '../social/social'
import EditableAvatar from '../images/editable-avatar/editable-avatar'
import Scroll from '../navigation/scroll'
import Modal from '../navigation/modal'

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
      name: contact.name || '',
      outlets: this.atLeastOne(contact.outlets, ''),
      emails: this.atLeastOne(contact.emails, 'Email'),
      phones: this.atLeastOne(contact.phones, 'Phone'),
      socials,
      showErrors: false,
      fixHeaderPosition: false
    }, this.props.prefill)
    state.errors = this.validate(state)
    return state
  },

  validate ({name, emails}) {
    const errors = {}
    if (!name) errors.name = 'Please add a contact name'
    const emailRegEx = /.+@.{2,}\..{2,}/
    const emailErrors = emails.map((e, i) => {
      const {value} = e
      if (!value || value.match(emailRegEx)) return false
      return 'Looks like this isn’t a valid email'
    })
    const hasEmailErrors = emailErrors.filter((e) => e).length > 0
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

  onSubmit (evt) {
    evt.preventDefault()
    const isValid = this.isValid(this.state.errors)
    if (!isValid) {
      return this.setState({showErrors: true})
    }
    const data = cloneDeep(this.state)
    ContactCreateSchema.clean(data)
    data.outlets = data.outlets.filter((o) => o.label || o.value)
    data.emails = data.emails.filter((o) => o.value)
    data.phones = data.phones.filter((o) => o.value)
    data.socials = data.socials.filter((o) => o.value)
    this.props.onSubmit(data)
  },

  atLeastOne (arr, label) {
    if (!arr || !arr.length) return [{ label: label, value: '' }]
    return cloneDeep(arr)
  },

  isValid (errors) {
    return Object.keys(errors).length < 1
  },

  onAvatarChange (evt) {
    const {url, screenName} = evt
    this.setState((s) => {
      const newState = {avatar: url}
      if (!screenName) return newState

      const socials = cloneDeep(s.socials)
      const i = socials.findIndex((so) => so.label === 'Twitter')
      const {value} = socials[i]
      // avoid overwriting and exiting twitter screenName
      if (!value) {
        socials[i].value = screenName
        newState.socials = socials
      }
      return newState
    })
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

  inputSize (value) {
    if (!value || value.length < 11) return 12
    return value.length + 2
  },

  onDismissErrorBanner () {
    const errors = cloneDeep(this.state.errors)
    delete errors.headline
    this.setState({errors})
  },

  onScrollChange ({scrollTop}) {
    const {fixHeaderPosition} = this.state
    const threashold = 162
    if (scrollTop > threashold && !fixHeaderPosition) {
      this.setState({fixHeaderPosition: true})
    }
    if (scrollTop < threashold && fixHeaderPosition) {
      this.setState({fixHeaderPosition: false})
    }
  },

  render () {
    const { onAvatarChange, onAvatarError, onJobTitleChange, onJobOrgChange, onJobOrgSelect, onJobTitleSelect, onAddJob, onProfileChange, onEmailChange, onAddEmail, onPhoneChange, onAddPhone, onSocialChange, onAddSocial, onSubmit, onDelete, inputSize, onScrollChange, onDismissErrorBanner } = this
    const { onDismiss } = this.props
    const { name, avatar, outlets, emails, phones, socials, errors, showErrors, fixHeaderPosition } = this.state
    return (
      <div className='relative'>
        <ValidationBanner show={showErrors} error={errors.headline} onDismiss={onDismissErrorBanner} />
        <div className='absolute top-0 left-0 right-0' style={{transition: 'opacity 1s', zIndex: 1, display: fixHeaderPosition ? 'block' : 'none'}}>
          <ValidationBanner show={showErrors} error={errors.headline} onDismiss={onDismissErrorBanner} />
          <div className='py3 center bg-white border-bottom border-gray80'>
            <div className='center f-xl gray20'>{name || 'Create Contact'}</div>
          </div>
        </div>
        <Scroll height={'calc(95vh - 76px)'} onScrollChange={onScrollChange} className='relative'>
          <div className={`py6 center bg-white border-bottom border-gray80`}>
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
                value={name}
                size={inputSize(name)}
                onChange={onProfileChange} />
              <FormError show={showErrors} error={errors.name} className='' />
            </div>
          </div>

          <div className='bg-gray90 pb6'>
            <FormSection label='Jobs' addLinkText='Add another job' onAdd={onAddJob}>
              {outlets.map((outlet, index) => (
                <div key={index} className='flex items-center mb2'>
                  <FilledCircle className='flex-none mr2 gray60' />
                  <div className='flex-auto'>
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
                  <div className='flex-auto ml4'>
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
                return (
                  <div key={index} className='flex items-center mb2'>
                    <EmailIcon className='flex-none mr2' />
                    <div className='flex-auto'>
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
                <div key={index} className='flex items-center mb2'>
                  <PhoneIcon className='flex-none mr2' />
                  <div className='flex-auto'>
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
                <div key={index} className='flex items-center mb2'>
                  <SocialIcon label={label} value={value} className=' mr2 flex-none' />
                  <div className='flex-auto'>
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
        </Scroll>
        <div className='flex items-center p4 bg-white border-top border-gray80'>
          {this.props.contact && <button className='flex-none btn bg-transparent not-interested' onClick={onDelete}>Delete Contact</button>}
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={onDismiss}>Cancel</button>
            <button className='btn bg-completed white' onClick={onSubmit}>Save Changes</button>
          </div>
        </div>
      </div>
    )
  }
})

const EditContactModal = Modal(EditContact)

export default EditContactModal
