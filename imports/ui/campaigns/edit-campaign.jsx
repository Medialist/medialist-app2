import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import cloneDeep from 'lodash.clonedeep'
import immutable from 'object-path-immutable'
import { CameraIcon, BioIcon, WebsiteIcon, FilledCircle } from '../images/icons'
import Modal from '../navigation/modal'
import { atLeastOne } from '/imports/lib/forms'
import ValidationBanner from '../forms/validation-banner'
import FormSection from '../forms/form-section'
import FormField from '../forms/form-field'
import EditableAvatar from '../images/editable-avatar'
import ClientAutocomplete from './client-autocomplete'
import { create, update } from '/imports/api/campaigns/methods'
import { MedialistCreateSchema } from '/imports/api/campaigns/campaigns'
import { Form, Input, Textarea, Button } from '@achingbrain/react-validation'

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
      errorHeader: null
    }
    return state
  },
  onAvatarChange ({url}) {
    this.setState({avatar: url})
  },
  onAvatarError (err) {
    console.error('Failed to change avatar', err)
    console.log('TODO: toast error message')
  },
  onFieldChange (event) {
    const { name, value } = event.target
    this.setState((s) => immutable.set(s, name, value))
  },
  onAutocomplete ({name, value}) {
    this.setState((s) => immutable.set(s, name, value))
  },
  addLink () {
    this.setState((s) => ({
      links: [...s.links, { url: '' }]
    }))
  },
  onSubmit (evt) {
    evt.preventDefault()

    const errors = this.form.validateAll()

    if (Object.keys(errors).length) {
      let headlineError = null
      const emailError = Object.keys(errors).find(key => key.includes('emails-'))

      if (errors.name) {
        headlineError = 'Please add a campaign name'
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
    MedialistCreateSchema.clean(data)
    data.links = data.links.filter((o) => o.url)

    if (!data.purpose) {
      data.purpose = null
    }

    if (this.props.campaign) {
      update.call({ _id: this.props.campaign._id, ...data }, (err, res) => {
        if (err) return console.error('Failed to edit campaign', err)
        this.props.onDismiss()
      })
    } else {
      create.call(data, (err, slug) => {
        if (err) return console.error('Failed to create campaign', err)
        this.props.router.push(`/campaign/${slug}`)
      })
    }
  },
  onReset () {
    this.props.onDismiss()
  },
  onDismissErrorBanner () {
    this.setState({
      errorHeader: null
    })
  },
  inputSize (value) {
    if (!value || value.length < 14) return 15
    return value.length + 2
  },
  render () {
    if (!this.props.open) return null
    const { onReset, onAvatarChange, onAvatarError, onDismissErrorBanner, inputSize } = this
    const { campaign } = this.props
    const { avatar, name, purpose, clientName, links } = this.state
    return (
      <Form className='relative' data-id='edit-campaign-form' onSubmit={this.onSubmit} ref={(form) => { this.form = form }}>
        <ValidationBanner error={this.state.errorHeader} onDismiss={onDismissErrorBanner} />
        <div className='px4 py6 center border-bottom border-gray80'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuTop={-50}>
            <div className='bg-gray60 center rounded mx-auto' style={{height: '110px', width: '110px', lineHeight: '110px'}}>
              { avatar ? <img src={avatar} width='100%' height='100%' /> : <CameraIcon className='svg-icon-xl' /> }
            </div>
          </EditableAvatar>
          <div>
            <Input
              autoComplete='off'
              className='center gray10 input-inline mt4 f-xxxl semibold placeholder-gray60'
              errorClassName='error'
              data-id='campaign-name-input'
              placeholder='Campaign name'
              type='text'
              name='name'
              value={name}
              size={inputSize(name)}
              onChange={this.onFieldChange}
              validations={['required']} />
          </div>
        </div>

        <div className='bg-gray90 pb6'>
          <FormSection label='Client'>
            <FormField icon={<FilledCircle />}>
              <ClientAutocomplete
                style={{width: 472}}
                menuWidth={472}
                className='input block placeholder-gray60'
                data-id='client-input'
                name='clientName'
                placeholder='Client'
                value={clientName}
                onSelect={this.onAutocomplete}
                onChange={this.onFieldChange}
              />
            </FormField>
          </FormSection>

          <FormSection label='Key Message'>
            <FormField icon={<BioIcon />}>
              <Textarea
                style={{height: '70px'}}
                className='input block textarea placeholder-gray60'
                type='text'
                rows='5'
                name='purpose'
                value={purpose}
                placeholder='Key Message'
                onChange={this.onFieldChange}
                data-id='key-message-input'
                validations={[]} />
            </FormField>
          </FormSection>

          <FormSection label='Links' addLinkText='Add another link' addLinkId='add-link-button' onAdd={this.addLink}>
            {links.map((link, index) => (
              <FormField icon={<WebsiteIcon />} key={index}>
                <Input
                  className='input flex-auto placeholder-gray60'
                  data-id={`link-input-${index}`}
                  name={`links.${index}.url`}
                  type='text'
                  value={links[index].url || undefined}
                  placeholder='Links'
                  onChange={this.onFieldChange}
                  validations={['url']} />
              </FormField>
            ))}
          </FormSection>
        </div>
        <div className='p4 right'>
          <Button className='btn bg-completed white right' data-id='save-campaign-button' disabled={false}>
            {campaign ? 'Save Changes' : 'Create Campaign'}
          </Button>
          <button className='btn bg-transparent gray40 right mr2' onClick={onReset}>Cancel</button>
        </div>
      </Form>
    )
  }
})

export default Modal(withRouter(EditCampaign))
