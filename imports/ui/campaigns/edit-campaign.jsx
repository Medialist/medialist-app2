import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { CameraIcon, BioIcon, WebsiteIcon } from '../images/icons'

const emptyFormData = {
  name: '',
  purpose: '',
  clientName: '',
  website: ''
}

const EditCampaignContainer = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired
  },
  getInitialState () {
    return {
      campaign: emptyFormData
    }
  },
  onChange (name, value) {
    const newState = Object.assign({}, this.state.campaign, {[name]: value})
    this.setState({ campaign: newState })
    console.log('got an update on state', this.state)
  },
  onSubmit () {
    console.log('Payload', this.state.campaign)
  },
  render () {
    const props = Object.assign({}, this.state, this.props)
    return <EditCampaign {...props} />
  }
})

const EditCampaign = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired,
    campaign: PropTypes.object.isRequired
  },
  onChange (evt) {
    const { name, value } = evt.target
    this.props.onChange(name, value)
  },
  onSubmit (evt) {
    evt.preventDefault()
    this.props.onSubmit()
  },
  onReset () {
    this.props.onDismiss()
    this.setState({ formData: emptyFormData })
  },
  render () {
    if (!this.props.open) return null
    const { onChange, onSubmit, onReset } = this
    const { open, onDismiss, campaign } = this.props
    const { name, purpose, clientName, website } = campaign
    const htmlStyle = open ? 'height:100%; overflow:hidden' : ''
    const inputWidth = 270
    const iconWidth = 30
    const inputStyle = { width: inputWidth, resize: 'none' }
    const iconStyle = { width: iconWidth }

    return (
      <div>
        <Helmet htmlAttributes={{ style: htmlStyle }} />
        <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={onDismiss} />
        <div className='absolute top-0 right-0 left-0 bg-white fit mx-auto mt6' style={{width: 675}}>
          <div className='inline-block right pointer f-xxl mx2 gray60 hover-blue' onClick={onDismiss}>&times;</div>
          <form onChange={onChange} onSubmit={onSubmit} onReset={onReset}>
            <div className='p4 center'>
              <div className='bg-gray40 center rounded mx-auto' style={{height: '123px', width: '123px', lineHeight: '123px'}}>
                <CameraIcon />
              </div>
              <div>
                <input
                  className='center gray60 input-inline mt4 f-xxl semibold'
                  type='text'
                  name='name'
                  value={name}
                  placeholder='Campaign Name'
                  size={name.length + 2} />
              </div>
              <div>
                <input
                  className='center gray60 input-inline mt1 f-lg gray10'
                  type='text'
                  name='clientName'
                  value={clientName}
                  placeholder='Client'
                  size={name.length + 2} />
              </div>
            </div>
            <div className='bg-gray90 border-top border-gray80'>
              <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Details</label>
              <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
                <div className='pt3'>
                  <BioIcon style={iconStyle} className='inline-block align-top' />
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
                  <WebsiteIcon style={iconStyle} className='inline-block align-top' />
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
        </div>
      </div>
    )
  }
})

export default EditCampaignContainer
