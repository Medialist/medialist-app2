import React, { PropTypes } from 'react'
import { CameraIcon, BioIcon, WebsiteIcon } from '../images/icons'
import Modal from '../navigation/modal'
import EditableAvatar from '../images/editable-avatar'
import ClientAutocomplete from './client-autocomplete'
import { create, update } from '/imports/api/medialists/methods'

const EditCampaign = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired,
    campaign: PropTypes.object
  },
  getInitialState () {
    const { campaign } = this.props
    return {
      avatar: campaign && campaign.avatar || '',
      name: campaign && campaign.name || '',
      purpose: campaign && campaign.purpose || '',
      clientName: campaign && campaign.client && campaign.client.name || '',
      website: campaign && campaign.website || ''
    }
  },
  componentDidMount () {
    this.nameInput.focus()
  },
  onAvatarChange ({url}) {
    this.setState({avatar: url})
  },
  onAvatarError (err) {
    console.error('Failed to change avatar', err)
    console.log('TODO: toast error message')
  },
  onClientNameChange (clientName) {
    this.setState({clientName})
  },
  onClientSelect (name) {
    this.setState({clientName: name})
  },
  updateField (field, value) {
    this.setState({ [field]: value })
  },
  onChange (evt) {
    const { name, value } = evt.target
    const { updateField } = this
    updateField(name, value)
  },
  onSubmit (evt) {
    evt.preventDefault()
    const { campaign } = this.props
    const { avatar, name, purpose, clientName, website } = this.state
    const payload = { avatar, name, purpose, clientName, website }
    const done = (err) => {
      if (err) return console.error('Failed to edit campaign', err)
      this.props.onDismiss()
    }

    if (campaign) {
      update.call({ _id: campaign._id, ...payload }, done)
    } else {
      create.call(payload, done)
    }
  },
  onReset () {
    this.props.onDismiss()
  },
  render () {
    if (!this.props.open) return null
    const { onChange, onSubmit, onReset, onClientNameChange, onClientSelect, onAvatarChange, onAvatarError } = this
    const { campaign, clients } = this.props
    const { avatar, name, purpose, clientName, website } = this.state
    const inputWidth = 270
    const iconWidth = 30
    const inputStyle = { width: inputWidth, resize: 'none' }
    const iconStyle = { width: iconWidth }
    return (
      <form onSubmit={onSubmit} onReset={onReset}>
        <div className='px4 py6 center'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError}>
            <div className='bg-gray40 center rounded mx-auto' style={{height: '123px', width: '123px', lineHeight: '123px'}}>
              { avatar ? <img src={avatar} width='100%' height='100%' /> : <CameraIcon /> }
            </div>
          </EditableAvatar>
          <div>
            <input
              ref={(input) => { this.nameInput = input }}
              autoComplete='off'
              className='center gray10 input-inline mt4 f-xxxl semibold'
              type='text'
              name='name'
              value={name}
              placeholder='Campaign Name'
              size={name.length === 0 ? 15 : name.length + 2}
              onChange={onChange}
               />
          </div>
          <ClientAutocomplete
            clients={clients}
            className='center input-inline mt1 f-lg gray10'
            name='clientName'
            clientName={clientName}
            onSelect={onClientSelect}
            onChange={onClientNameChange} />
        </div>
        <div className='bg-gray90 border-top border-gray80'>
          <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Details</label>
          <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
            <div className='pt3'>
              <BioIcon style={iconStyle} className='inline-block align-top mt1' />
              <div className='inline-block align-middle'>
                <textarea
                  style={inputStyle}
                  className='textarea'
                  type='text'
                  rows='5'
                  name='purpose'
                  value={purpose}
                  placeholder='Key Message'
                  onChange={onChange} />
              </div>
            </div>
            <div className='pt3'>
              <WebsiteIcon style={iconStyle} className='inline-block' />
              <div className='inline-block align-middle'>
                <input
                  style={inputStyle}
                  className='input'
                  type='text'
                  name='website'
                  value={website}
                  placeholder='Website'
                  onChange={onChange} />
              </div>
            </div>
          </div>
        </div>
        <div className='p4 right'>
          <button className='btn bg-completed white right' type='submit'>
            {campaign ? 'Edit' : 'Create'} Campaign
          </button>
          <button className='btn bg-transparent gray40 right mr2' type='reset'>Cancel</button>
        </div>
      </form>
    )
  }
})

export default Modal(EditCampaign)
