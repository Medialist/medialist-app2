import React, { PropTypes } from 'react'
import { CameraIcon, BioIcon, WebsiteIcon } from '../images/icons'
import { Meteor } from 'meteor/meteor'
import Modal from '../navigation/modal'
import Autocomplete from './autocomplete'

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
      campaign: {
        name: campaign && campaign.name || '',
        purpose: campaign && campaign.purpose || '',
        clientName: campaign && campaign.client.name || '',
        clientId: campaign && campaign.client._id || '',
        website: ''
      }
    }
  },
  updateField (field, value) {
    const newValues = Object.assign({}, this.state.campaign, {[field]: value})
    this.setState({ campaign: newValues })
  },
  onChange (evt) {
    const { name, value } = evt.target
    const { updateField } = this
    updateField(name, value)
  },
  onSubmit (evt) {
    evt.preventDefault()
    const { name, purpose, clientName, clientId } = this.state.campaign
    const payload = {
      name,
      purpose,
      client: {
        _id: clientId,
        name: clientName
      }
    }
    if (!payload.client.name || !payload.client._id || !payload.name) return
    Meteor.call('medialists/create', payload)
    this.props.onDismiss()
  },
  onReset () {
    this.props.onDismiss()
  },
  render () {
    if (!this.props.open) return null
    const { onChange, onSubmit, onReset, updateField } = this
    const { clients } = this.props
    const { name, purpose, clientName, website } = this.state.campaign
    const inputWidth = 270
    const iconWidth = 30
    const inputStyle = { width: inputWidth, resize: 'none' }
    const iconStyle = { width: iconWidth }

    return (
      <form onChange={onChange} onSubmit={onSubmit} onReset={onReset}>
        <div className='p4 center'>
          <div className='bg-gray40 center rounded mx-auto' style={{height: '123px', width: '123px', lineHeight: '123px'}}>
            <CameraIcon />
          </div>
          <div>
            <input
              className='center gray10 input-inline mt4 f-xxl semibold'
              type='text'
              name='name'
              value={name}
              placeholder='Campaign Name'
              size={name.length === 0 ? 15 : name.length + 2} />
          </div>
          <Autocomplete
            clients={clients}
            className='center input-inline mt1 f-lg gray10'
            name='clientName'
            value={clientName}
            updateField={updateField} />
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
                  placeholder='Key Message' />
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
                  placeholder='Website' />
              </div>
            </div>
          </div>
        </div>
        <div className='p4 right'>
          <button className='btn bg-completed white right' type='submit'>Create Campaign</button>
          <button className='btn bg-transparent gray40 right mr2' type='reset'>Cancel</button>
        </div>
      </form>
    )
  }
})

export default Modal(EditCampaign)
