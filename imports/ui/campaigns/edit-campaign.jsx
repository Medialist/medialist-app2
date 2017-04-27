import React from 'react'
import PropTypes from 'prop-types'
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
import withSnackbar from '../snackbar/with-snackbar'

const inputSize = (value) => {
  if (!value || value.length < 14) {
    return 15
  }

  return value.length + 2
}

const EditCampaign = withSnackbar(React.createClass({
  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
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

    this.props.onSubmit(data)
  },
  onDismissErrorBanner () {
    this.setState({
      errorHeader: null
    })
  },
  render () {
    return (
      <Form className='relative' data-id='edit-campaign-form' onSubmit={this.onSubmit} ref={(form) => { this.form = form }}>
        <ValidationBanner error={this.state.errorHeader} onDismiss={this.onDismissErrorBanner} />
        <div className='px4 py6 center border-bottom border-gray80'>
          <EditableAvatar className='ml2' avatar={this.state.avatar} onChange={this.onAvatarChange} onError={this.onAvatarError} menuTop={-50}>
            <div className='bg-gray60 center rounded mx-auto' style={{height: '110px', width: '110px', lineHeight: '110px'}}>
              { this.state.avatar ? <img src={this.state.avatar} width='100%' height='100%' /> : <CameraIcon className='svg-icon-xl' /> }
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
              value={this.state.name}
              size={inputSize(this.state.name)}
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
                value={this.state.clientName}
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
                value={this.state.purpose}
                placeholder='Key Message'
                onChange={this.onFieldChange}
                data-id='key-message-input'
                validations={[]} />
            </FormField>
          </FormSection>

          <FormSection label='Links' addLinkText='Add another link' addLinkId='add-link-button' onAdd={this.addLink}>
            {this.state.links.map((link, index) => (
              <FormField icon={<WebsiteIcon />} key={index}>
                <Input
                  className='input flex-auto placeholder-gray60'
                  data-id={`link-input-${index}`}
                  name={`links.${index}.url`}
                  type='text'
                  value={link.url || undefined}
                  placeholder='Links'
                  onChange={this.onFieldChange}
                  validations={['url']} />
              </FormField>
            ))}
          </FormSection>
        </div>
        <div className='p4 right'>
          <Button className='btn bg-completed white right' data-id='save-campaign-button' disabled={false}>
            {this.props.campaign ? 'Save Changes' : 'Create Campaign'}
          </Button>
          <button className='btn bg-transparent gray40 right mr2' onClick={this.props.onCancel}>Cancel</button>
        </div>
      </Form>
    )
  }
}))

const EditCampaignForm = withRouter(withSnackbar(React.createClass({
  propTypes: {
    campaign: PropTypes.object.isRequired
  },

  onSubmit (details) {
    update.call({ _id: this.props.campaign._id, ...details }, (error) => {
      if (error) {
        console.log(error)
        this.props.snackbar.error('campaign-update-failure')

        return
      }

      this.props.snackbar.show(`Updated ${details.name}`, 'campaign-update-success')
      this.props.onDismiss()
    })
  },

  onDelete () {

  },

  render () {
    return (
      <EditCampaign
        campaign={this.props.campaign}
        onSubmit={this.onSubmit}
        onDelete={this.onDelete}
        onCancel={this.props.onDismiss}
       />
    )
  }
})))

const CreateCampaignForm = withRouter(withSnackbar(React.createClass({
  propTypes: {

  },

  onSubmit (details) {
    create.call(details, (error, slug) => {
      if (error) {
        console.log(error)
        this.props.snackbar.error('campaign-create-failure')

        return
      }

      this.props.snackbar.show(`Created ${details.name}`, 'campaign-create-success')
      this.props.router.push(`/campaign/${slug}`)
      this.props.onDismiss()
    })
  },

  render () {
    return (
      <EditCampaign
        onSubmit={this.onSubmit}
        onCancel={this.props.onDismiss}
       />
    )
  }
})))

export const EditCampaignModal = Modal(EditCampaignForm)

export const CreateCampaignModal = Modal(CreateCampaignForm)
