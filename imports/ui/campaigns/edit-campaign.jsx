import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import cloneDeep from 'lodash.clonedeep'
import immutable from 'object-path-immutable'
import { CameraIcon, BioIcon, WebsiteIcon, FilledCircle } from '../images/icons'
import Modal from '../navigation/modal'
import { hasErrors, atLeastOne } from '/imports/lib/forms'
import ValidationBanner from '../forms/validation-banner'
import FormSection from '../forms/form-section'
import FormField from '../forms/form-field'
import FormError from '../forms/form-error'
import EditableAvatar from '../images/editable-avatar'
import ClientAutocomplete from './client-autocomplete'
import { create, update } from '/imports/api/campaigns/methods'
import { MedialistCreateSchema } from '/imports/api/campaigns/campaigns'

const EditCampaign = React.createClass({
  propTypes: {
    router: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object
  },
  getInitialState () {
    const campaign = this.props.campaign || {}
    const state = {
      avatar: campaign.avatar || '',
      name: campaign.name || '',
      purpose: campaign.purpose || '',
      clientName: campaign.client && campaign.client.name || '',
      links: atLeastOne(campaign.links, { url: '' }),
      showErrors: false
    }
    state.errors = this.validate(state)
    return state
  },
  onAvatarChange ({url}) {
    this.setState({avatar: url})
  },
  onAvatarError (err) {
    console.error('Failed to change avatar', err)
    console.log('TODO: toast error message')
  },
  onClientNameChange (evt) {
    const {value} = evt.target
    this.setState({clientName: value})
  },
  onClientSelect ({name, value}) {
    this.setState({clientName: value})
  },
  onChange (evt) {
    const {name, value} = evt.target
    this.setState({ [name]: value })
    this.setState((s) => ({
      errors: this.validate(s)
    }))
  },
  onLinkChange (evt) {
    const {name: i, value} = evt.target
    this.setState((s) => immutable.set(s, `links.${i}.url`, value))
    this.setState((s) => ({
      errors: this.validate(s)
    }))
  },
  addLink () {
    this.setState((s) => ({
      links: [...s.links, { url: '' }]
    }))
  },
  onSubmit (evt) {
    evt.preventDefault()
    if (hasErrors(this.state)) {
      return this.setState({showErrors: true})
    }
    const { campaign, router, onDismiss } = this.props
    const { avatar, name, purpose, clientName, links } = this.state
    const payload = { avatar, name, purpose, clientName, links: links.filter((l) => l.url) }
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === []) delete payload[k]
    })
    if (campaign) {
      update.call({ _id: campaign._id, ...payload }, (err, res) => {
        if (err) return console.error('Failed to edit campaign', err)
        onDismiss()
      })
    } else {
      create.call(payload, (err, slug) => {
        if (err) return console.error('Failed to create campaign', err)
        router.push(`/campaign/${slug || campaign.slug}`)
      })
    }
  },
  onReset () {
    this.props.onDismiss()
  },
  validate (state) {
    const { avatar, name, purpose, clientName, links } = state
    const validationContext = MedialistCreateSchema.newContext()
    const campaign = { avatar, name, purpose, clientName, links: links.filter((l) => l.url) }
    validationContext.validate(campaign)
    const errors = validationContext.invalidKeys().reduce((errors, error) => {
      const field = error.name
      errors[field] = `Please add a ${MedialistCreateSchema.label(field)}`
      if (field.substr(0, 5) === 'links') errors.links = 'Please only use valid URLs'
      return errors
    }, {})
    const errorsCount = Object.keys(errors).length
    if (errorsCount > 0) {
      errors.headline = errorsCount > 1 ? 'Let\'s add a little more detail' : errors[Object.keys(errors)[0]]
    }
    return errors
  },
  onDismissErrorBanner () {
    const errors = cloneDeep(this.state.errors)
    delete errors.headline
    this.setState({errors})
  },
  render () {
    if (!this.props.open) return null
    const { onChange, onLinkChange, onSubmit, onReset, onClientNameChange, onClientSelect, onAvatarChange, onAvatarError, onDismissErrorBanner } = this
    const { campaign } = this.props
    const { avatar, name, purpose, clientName, links, errors, showErrors } = this.state
    return (
      <div className='relative'>
        <ValidationBanner error={errors.headline} show={showErrors} onDismissErrorBanner={onDismissErrorBanner} />
        <div className='px4 py6 center border-bottom border-gray80'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuTop={-50}>
            <div className='bg-gray60 center rounded mx-auto' style={{height: '110px', width: '110px', lineHeight: '110px'}}>
              { avatar ? <img src={avatar} width='100%' height='100%' /> : <CameraIcon className='svg-icon-xl' /> }
            </div>
          </EditableAvatar>
          <div>
            <input
              autoComplete='off'
              className={`center gray10 input-inline mt4 f-xxxl semibold placeholder-gray60 ${errors.name && showErrors ? 'error' : ''}`}
              type='text'
              name='name'
              value={name}
              placeholder='Campaign name'
              size={name.length === 0 ? 15 : name.length + 2}
              onChange={onChange}
              id='campaign-name-input' />
            <FormError error={errors.name} show={showErrors} />
          </div>
        </div>

        <div className='bg-gray90 pb6'>
          <FormSection label='Client'>
            <FormField icon={<FilledCircle />}>
              <ClientAutocomplete
                style={{width: 472}}
                menuWidth={472}
                className='input block placeholder-gray60'
                name='clientName'
                placeholder='Client'
                value={clientName}
                onSelect={onClientSelect}
                onChange={onClientNameChange}
                id='client-input' />
            </FormField>
          </FormSection>

          <FormSection label='Key Message'>
            <FormField icon={<BioIcon />}>
              <textarea
                style={{height: '70px'}}
                className='input block textarea placeholder-gray60'
                type='text'
                rows='5'
                name='purpose'
                value={purpose}
                placeholder='Key Message'
                onChange={onChange}
                id='key-message-input' />
            </FormField>
          </FormSection>

          <FormSection label='Links' addLinkText='Add another link' onAdd={this.addLink}>
            {links.map((link, i) => (
              <FormField icon={<WebsiteIcon />} key={i}>
                <input
                  className='input flex-auto placeholder-gray60 links-input'
                  type='text'
                  value={links[i].url}
                  placeholder='Links'
                  onChange={onLinkChange} />
                <FormError error={errors[`link-${i}`]} show={showErrors} />
              </FormField>
            ))}
          </FormSection>
        </div>
        <div className='p4 right'>
          <button className='btn bg-completed white right' onClick={onSubmit} id='save-campaign-button'>
            {campaign ? 'Save Changes' : 'Create Campaign'}
          </button>
          <button className='btn bg-transparent gray40 right mr2' onClick={onReset}>Cancel</button>
        </div>
      </div>
    )
  }
})

export default Modal(withRouter(EditCampaign))
