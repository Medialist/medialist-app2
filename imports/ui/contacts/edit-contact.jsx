import React, { PropTypes } from 'react'
import cloneDeep from 'lodash.clonedeep'
import immutable from 'object-path-immutable'
import { ContactCreateSchema } from '/imports/api/contacts/contacts'
import { atLeastOne } from '/imports/lib/forms'
import ValidationBanner from '../forms/validation-banner'
import FormField from '../forms/form-field'
import FormSection from '../forms/form-section'
import OutletAutocomplete from '../forms/outlet-autocomplete'
import { CameraIcon, FilledCircle, EmailIcon, PhoneIcon } from '../images/icons'
import { SocialMap, SocialIcon } from '../social/social'
import EditableAvatar from '../images/editable-avatar/editable-avatar'
import Scroll from '../navigation/scroll'
import Modal from '../navigation/modal'
import { Form, Input, Button } from '@achingbrain/react-validation'
import { createContact, updateContact } from '/imports/api/contacts/methods'

const EditContact = React.createClass({
  propTypes: {
    open: PropTypes.bool,
    contact: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    // Allow some prefill data to be passed in
    prefill: PropTypes.shape({
      name: PropTypes.string
    })
  },

  getInitialState () {
    const contact = this.props.contact || {
      socials: []
    }

    // Create the full socials list, setting any existing social values.
    const socials = Object.keys(SocialMap).map((label, i) => {
      const existing = contact.socials && contact.socials.find((s) => s.label === label)
      if (existing) return Object.assign({}, existing)
      return {label, value: ''}
    })

    // Some socials, eg. Website can have more than one entry so add
    // them to the end of the list
    contact.socials.forEach(social => {
      const existing = socials.find(s => s.label === social.label)

      if (existing && existing.value !== social.value) {
        socials.push({
          label: social.label,
          value: social.value
        })
      }
    })

    const state = Object.assign({
      avatar: contact.avatar || '',
      name: contact.name || '',
      outlets: atLeastOne(contact.outlets, {label: '', value: ''}),
      emails: atLeastOne(contact.emails, {label: 'Email', value: ''}),
      phones: atLeastOne(contact.phones, {label: 'Phone', value: ''}),
      socials,
      fixHeaderPosition: false,
      errorHeader: null
    }, this.props.prefill)
    return state
  },

  onSubmit (evt) {
    evt.preventDefault()

    const errors = this.form.validateAll()

    if (Object.keys(errors).length) {
      let headlineError = null
      const emailError = Object.keys(errors).find(key => key.includes('emails-'))

      if (errors.name) {
        headlineError = 'Please add a contact name'
      } else if (emailError) {
        headlineError = 'Looks like that isn’t a valid email'
      } else {
        headlineError = 'Let’s add a little more detail'
      }

      this.setState({
        errorHeader: headlineError
      })

      return
    }

    const data = cloneDeep(this.state)
    ContactCreateSchema.clean(data)
    data.outlets = data.outlets.filter((o) => o.label || o.value)
    data.emails = data.emails.filter((o) => o.value)
    data.phones = data.phones.filter((o) => o.value)
    data.socials = data.socials.filter((o) => o.value)
    this.props.onSubmit(data)
  },

  onFieldChange (event) {
    const { name, value } = event.target
    this.setState((s) => immutable.set(s, name, value))
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

  onAutocomplete ({name, value}) {
    this.setState((s) => immutable.set(s, name, value))
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

  onAddPhone () {
    this.onAdd('phones', {label: 'Phone', value: ''})
  },

  onAddSocial () {
    this.onAdd('socials', {label: 'Website', value: ''})
  },

  inputSize (value) {
    if (!value || value.length < 11) return 12
    return value.length + 2
  },

  onDismissErrorBanner () {
    this.setState({
      errorHeader: null
    })
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
    const { onAvatarChange, onAvatarError, onAddJob, onAddEmail, onAddPhone, onAddSocial, onDelete, inputSize, onScrollChange, onDismissErrorBanner } = this
    const { onDismiss } = this.props
    const { name, avatar, outlets, emails, phones, socials, fixHeaderPosition } = this.state
    return (
      <Form data-id='edit-contact-form' className='relative' onSubmit={this.onSubmit} ref={(form) => { this.form = form }}>
        <ValidationBanner error={this.state.errorHeader} onDismiss={onDismissErrorBanner} />
        <div className='absolute top-0 left-0 right-0' style={{transition: 'opacity 1s', zIndex: 1, display: fixHeaderPosition ? 'block' : 'none'}}>
          <ValidationBanner error={this.state.errorHeader} onDismiss={onDismissErrorBanner} />
          <div className='py3 center bg-white border-bottom border-gray80'>
            <div className='center f-xl gray20'>{name || 'Create Contact'}</div>
          </div>
        </div>
        <Scroll height={'calc(95vh - 76px)'} onScrollChange={onScrollChange}>
          <div className={`py6 center bg-white border-bottom border-gray80`}>
            <EditableAvatar avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuTop={-20}>
              <div className='bg-gray60 center circle mx-auto' style={{height: '110px', width: '110px', lineHeight: '110px', overflowY: 'hidden'}}>
                { avatar ? <img src={avatar} width='110' height='110' /> : <CameraIcon className='svg-icon-xl' /> }
              </div>
            </EditableAvatar>
            <div>
              <Input
                autoComplete='off'
                className='center input-inline mt4 f-xxxl semibold'
                errorClassName='error'
                data-id='contact-name-input'
                placeholder='Contact Name'
                type='text'
                name='name'
                value={name}
                size={inputSize(name)}
                onChange={this.onFieldChange}
                validations={['required']} />
            </div>
          </div>

          <div className='bg-gray90 pb6'>
            <FormSection label='Jobs' addLinkText='Add another job' addLinkId='add-job-button' onAdd={onAddJob}>
              {outlets.map((outlet, index) => (
                <FormField key={index} icon={<FilledCircle />}>
                  <OutletAutocomplete
                    style={{width: 225}}
                    menuWidth={225}
                    className='input'
                    data-id={`job-title-input-${index}`}
                    data-paired-with={`outlets.${index}.label`}
                    value={outlet.value}
                    name={`outlets.${index}.value`}
                    field='value'
                    placeholder='Title'
                    onSelect={this.onAutocomplete}
                    onChange={this.onFieldChange}
                    validations={['paired']}
                  />
                  <div className='ml4 inline-block'>
                    <OutletAutocomplete
                      style={{width: 225}}
                      menuWidth={225}
                      className='input'
                      data-id={`job-company-input-${index}`}
                      data-paired-with={`outlets.${index}.value`}
                      value={outlet.label}
                      name={`outlets.${index}.label`}
                      field='label'
                      placeholder='Outlet'
                      onSelect={this.onAutocomplete}
                      onChange={this.onFieldChange}
                      validations={['paired']}
                    />
                  </div>
                </FormField>
              ))}
            </FormSection>

            <FormSection label='Emails' addLinkText='Add another email' addLinkId='add-email-button' onAdd={onAddEmail}>
              {emails.map((email, index) => {
                return (
                  <FormField key={index} icon={<EmailIcon />}>
                    <Input
                      style={{width: 350}}
                      className='input'
                      data-id={`email-input-${index}`}
                      errorClassName='error'
                      type='text'
                      value={email.value}
                      name={`emails.${index}.value`}
                      onChange={this.onFieldChange}
                      placeholder='Email'
                      validations={['email']} />
                  </FormField>
                )
              })}
            </FormSection>

            <FormSection label='Phones' addLinkText='Add another phone' addLinkId='add-phone-button' onAdd={onAddPhone}>
              {phones.map((phone, index) => (
                <FormField key={index} icon={<PhoneIcon />}>
                  <Input
                    style={{width: 350}}
                    className='input'
                    data-id={`phone-input-${index}`}
                    errorClassName='error'
                    type='text'
                    name={`phones.${index}.value`}
                    value={phone.value}
                    onChange={this.onFieldChange}
                    placeholder='Phone number'
                    validations={[]} />
                </FormField>
              ))}
            </FormSection>

            <FormSection label='Websites & Social Links' addLinkText='Add another social' addLinkId='add-social-button' onAdd={onAddSocial}>
              {socials.map(({label, value}, index) => (
                <FormField key={index} icon={<SocialIcon label={label} value={value} />}>
                  <Input
                    style={{width: 472}}
                    className='input'
                    data-id={`social-input-${index}`}
                    errorClassName='error'
                    type='text'
                    name={`socials.${index}.value`}
                    value={value}
                    onChange={this.onFieldChange}
                    placeholder={label}
                    validations={label === 'Website' ? ['url'] : ['username']} />
                </FormField>
              ))}
            </FormSection>
          </div>
        </Scroll>

        <div className='flex items-center p4 bg-white border-top border-gray80'>
          {this.props.contact && <button className='flex-none btn bg-transparent not-interested' onClick={onDelete}>Delete Contact</button>}
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={onDismiss}>Cancel</button>
            <Button className='btn bg-completed white' data-id='edit-contact-form-submit-button' disabled={false}>Save Changes</Button>
          </div>
        </div>
      </Form>
    )
  }
})

const EditContactModal = Modal(EditContact)

export default EditContactModal

export const EditContactForm = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    contact: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired,
    snackbar: PropTypes.object
  },

  onSubmit (details) {
    updateContact.call({details, contactId: this.props.contact._id}, (error) => {
      if (error) {
        console.log(error)

        return this.props.snackbar.show('Sorry, that didn\'t work')
      }

      this.props.snackbar.show(`Updated ${details.name.split(' ')[0]}`)
      this.props.onDismiss()
    })
  },

  render() {
    return (
      <EditContact
        open={this.props.open}
        contact={this.props.contact}
        onSubmit={this.onSubmit}
        onDismiss={this.props.onDismiss}
       />
    )
  }
})

export const CreateContactForm = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    contact: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired,
    snackbar: PropTypes.object
  },

  onSubmit (details) {
    createContact.call({details}, (error) => {
      if (error) {
        console.log(error)

        return this.props.snackbar.show('Sorry, that didn\'t work')
      }

      this.props.snackbar.show(`Updated ${details.name.split(' ')[0]}`)
      this.props.onDismiss()
    })
  },

  render() {
    return (
      <EditContact
        open={this.props.open}
        contact={this.props.contact}
        onSubmit={this.onSubmit}
        onDismiss={this.props.onDismiss}
       />
    )
  }
})
