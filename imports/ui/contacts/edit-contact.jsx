import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import cloneDeep from 'lodash.clonedeep'
import immutable from 'object-path-immutable'
import { ContactCreateSchema } from '/imports/api/contacts/contacts'
import { atLeastOne } from '/imports/lib/forms'
import ValidationBanner from '/imports/ui/forms/validation-banner'
import FormField from '/imports/ui/forms/form-field'
import FormSection from '/imports/ui/forms/form-section'
import OutletAutocomplete from '/imports/ui/forms/outlet-autocomplete'
import { CameraIcon, FilledCircle, EmailIcon, PhoneIcon, AddressIcon } from '/imports/ui/images/icons'
import { SocialMap, SocialIcon } from '/imports/ui/social/social'
import EditableAvatar from '/imports/ui/images/editable-avatar/editable-avatar'
import Scroll from '/imports/ui/navigation/scroll'
import Modal from '/imports/ui/navigation/modal'
import { Form, Input, Button } from '@achingbrain/react-validation'
import { createContact, updateContact, batchRemoveContacts } from '/imports/api/contacts/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'

const emptyAddress = { street: '', city: '', postcode: '', country: '' }

function cleanAddresses (addresses) {
  if (!addresses) return []
  return addresses
    .filter((address) => Object.keys(address).some((field) => !!address[field].length))
    .map((address) => Object.assign({}, emptyAddress, address))
}

const EditContact = withSnackbar(React.createClass({
  propTypes: {
    contact: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func
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
    if (contact.socials) {
      contact.socials.forEach(social => {
        const existing = socials.find(s => s.label === social.label)

        if (existing && existing.value !== social.value) {
          socials.push({
            label: social.label,
            value: social.value
          })
        }
      })
    }

    const state = Object.assign({
      avatar: contact.avatar || '',
      name: contact.name || '',
      outlets: atLeastOne(contact.outlets, {label: '', value: ''}),
      emails: atLeastOne(contact.emails, {label: 'Email', value: ''}),
      phones: atLeastOne(contact.phones, {label: 'Phone', value: ''}),
      socials,
      addresses: contact.addresses || [emptyAddress],
      fixHeaderPosition: false,
      errorHeader: null,
      deleteMenuOpen: false
    })
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
    data.addresses = cleanAddresses(data.addresses)
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

  onAvatarError (error) {
    console.error('Failed to change avatar', error)
    this.props.snackbar.error('contact-edit-avatar-failure')
  },

  onAutocomplete ({name, value}) {
    this.setState((s) => immutable.set(s, name, value))
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

  openDeleteMenu (event) {
    event.preventDefault()

    this.setState({
      deleteMenuOpen: true
    })
  },

  closeDeleteMenu (event) {
    if (event) {
      event.preventDefault()
    }

    this.setState({
      deleteMenuOpen: false
    })
  },

  render () {
    const { onAvatarChange, onAvatarError, onAddJob, onAddEmail, onAddPhone, onAddSocial, inputSize, onScrollChange, onDismissErrorBanner } = this
    const { name, avatar, outlets, emails, phones, socials, addresses, fixHeaderPosition } = this.state
    return (
      <Form data-id='edit-contact-form' className='relative' onSubmit={this.onSubmit} ref={(form) => { this.form = form }}>
        <ValidationBanner error={this.state.errorHeader} onDismiss={onDismissErrorBanner} />
        <div className='absolute top-0 left-0 right-0' style={{transition: 'opacity 1s', zIndex: 1, display: fixHeaderPosition ? 'block' : 'none'}}>
          <ValidationBanner error={this.state.errorHeader} onDismiss={onDismissErrorBanner} />
          <div className='py3 center bg-white border-bottom border-gray80'>
            <div className='center f-xl gray20'>{name || 'Create Contact'}</div>
          </div>
        </div>
        <Scroll height={'calc(95vh - 76px)'} onScrollChange={onScrollChange} className='bg-gray90'>
          <div className='py6 center bg-white border-bottom border-gray80 bg-white'>
            <EditableAvatar avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuTop={-20}>
              <div className='bg-gray60 center circle mx-auto' style={{height: '110px', width: '110px', lineHeight: '110px', overflowY: 'hidden'}}>
                { avatar ? <img src={avatar} width='110' height='110' /> : <CameraIcon className='svg-icon-xl' /> }
              </div>
            </EditableAvatar>
            <div>
              <Input
                autoComplete='off'
                className='center gray10 input-inline mt4 f-xxxl semibold placeholder-gray60'
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

          <div className='pb6'>
            <FormSection label='Jobs' addLinkText='Add another job' addLinkId='add-job-button' onAdd={onAddJob}>
              {outlets.map((outlet, index) => (
                <FormField key={index} icon={<FilledCircle />}>
                  <OutletAutocomplete
                    style={{width: 225}}
                    menuWidth={225}
                    className='input placeholder-gray60'
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
                      className='input placeholder-gray60'
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
                      className='input placeholder-gray60'
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
                    className='input placeholder-gray60'
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
                    className='input placeholder-gray60'
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

            <FormSection label='Address'>
              {addresses.map(({street, city, postcode, country}, index) => (
                <div key={`contact-addresses-${index}`}>
                  <FormField icon={<AddressIcon />}>
                    <Input
                      className='col col-12 input placeholder-gray60'
                      data-id={`address-input-street-${index}`}
                      name={`addresses.${index}.street`}
                      value={street}
                      onChange={this.onFieldChange}
                      placeholder='Street'
                      validations={[]}
                     />
                  </FormField>
                  <div className='clearfix'>
                    <Input
                      className='input placeholder-gray60 inline-block my2 left'
                      data-id={`address-input-city-${index}`}
                      name={`addresses.${index}.city`}
                      value={city}
                      onChange={this.onFieldChange}
                      placeholder='City'
                      style={{width: '48%'}}
                      validations={[]} />
                    <Input
                      className='input placeholder-gray60 inline-block my2 right'
                      data-id={`address-input-postcode-${index}`}
                      name={`addresses.${index}.postcode`}
                      value={postcode}
                      onChange={this.onFieldChange}
                      placeholder='Postcode'
                      style={{width: '48%'}}
                      validations={[]} />
                  </div>
                  <Input
                    className='input placeholder-gray60 inline-block mb2 left'
                    data-id={`address-input-country-${index}`}
                    name={`addresses.${index}.country`}
                    value={country}
                    onChange={this.onFieldChange}
                    placeholder='Country'
                    style={{width: '48%'}}
                    validations={[]} />
                </div>
              ))}
            </FormSection>
          </div>
        </Scroll>

        <div className='flex items-center p4 bg-white border-top border-gray80'>
          {this.props.onDelete && <Dropdown>
            <button className='flex-none btn bg-transparent not-interested' onClick={(event) => this.openDeleteMenu(event)} data-id='delete-contact-button'>Delete Contact</button>
            <DropdownMenu width={430} left={0} top={-270} arrowPosition='bottom' arrowAlign='left' arrowMarginLeft='55px' open={this.state.deleteMenuOpen} onDismiss={() => this.closeDeleteMenu()}>
              <div className='p1'>
                <p className='center m6'>Are you sure you want to <strong>delete this contact</strong>?</p>
                <p className='center m6'>Deleted contacts can't be retrieved.</p>
                <div className='flex-auto center m6'>
                  <button className='btn bg-transparent gray40 mr2' onClick={(event) => this.closeDeleteMenu(event)} data-id='cancel-delete-contact-button'>No, Keep Contact</button>
                  <button className='btn bg-not-interested white' onClick={(event) => this.props.onDelete(event)} data-id='confirm-delete-contact-button'>Yes, Delete Contact</button>
                </div>
              </div>
            </DropdownMenu>
          </Dropdown>}
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={this.props.onCancel} data-id='edit-contact-form-cancel-button'>Cancel</button>
            <Button className='btn bg-completed white' data-id='edit-contact-form-submit-button' disabled={false}>Save Changes</Button>
          </div>
        </div>
      </Form>
    )
  }
}))

const EditContactForm = withRouter(withSnackbar(React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired
  },

  onSubmit (details) {
    updateContact.call({details, contactId: this.props.contact._id}, (error, id) => {
      if (error) {
        console.log(error)

        return this.props.snackbar.error('contact-update-failure')
      }

      this.props.snackbar.show(`Updated ${details.name.split(' ')[0]}`, 'contact-update-success')
      this.props.onDismiss()
    })
  },

  onDelete (event) {
    event.preventDefault()

    batchRemoveContacts.call({_ids: [this.props.contact._id]}, (error) => {
      if (error) {
        console.log(error)

        return this.props.snackbar.error('contact-delete-failure')
      }

      this.props.snackbar.show(`Deleted ${this.props.contact.name}`, 'contact-delete-success')
      this.props.router.push('/contacts')
    })
  },

  render () {
    return (
      <EditContact
        contact={this.props.contact}
        onSubmit={this.onSubmit}
        onDelete={this.onDelete}
        onCancel={this.props.onDismiss}
       />
    )
  }
})))

const CreateContactForm = withRouter(withSnackbar(React.createClass({
  propTypes: {
    prefill: PropTypes.object
  },

  onSubmit (details) {
    createContact.call({details}, (error, slug) => {
      if (error) {
        console.log(error)

        return this.props.snackbar.error('contact-create-failure')
      }

      this.props.snackbar.show(`Created ${details.name.split(' ')[0]}`, 'contact-create-success')
      this.props.router.push(`/contact/${slug}`)
      this.props.onDismiss()
    })
  },

  render () {
    return (
      <EditContact
        contact={this.props.prefill}
        onSubmit={this.onSubmit}
        onCancel={this.props.onDismiss}
       />
    )
  }
})))

export const EditContactModal = Modal(EditContactForm)

export const CreateContactModal = Modal(CreateContactForm)
