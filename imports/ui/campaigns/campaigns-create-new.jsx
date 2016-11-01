import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import Helmet from 'react-helmet'
import { createContainer } from 'meteor/react-meteor-data'
import { CameraIcon, BioIcon, WebsiteIcon } from '../images/icons'
import MedialistsSchema from '../../../lib/collections-global/schemas/schemas'
import Clients from '../../../lib/collections-global/clients'

const CampaignModal = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired
  },
  getInitialState () {
    return {
      formData: {
        name: '',
        purpose: '',
        clientName: '',
        website: ''
      }
    }
  },
  onChange (evt) {
    if (evt.target.id === 'client') return this.autoComplete(evt)
    const formData = Object.assign(this.state.formData, { [evt.target.id]: evt.target.value }, {})
    this.setState({ formData })
  },
  autoComplete (evt) {
    console.log(this.state.clients)
  },
  onSubmit () {
    console.log(this.state.formData, MedialistsSchema)
  },
  render () {
    console.log(this.props)
    const { open, onDismiss } = this.props
    const htmlStyle = open ? 'height:100%; overflow:hidden' : ''

    if (!open) return null

    const { name } = this.state.formData
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
          <form onChange={this.onChange}>
            <div className='p4 center'>
              <div className='bg-gray40 center rounded mx-auto' style={{height: '123px', width: '123px', lineHeight: '123px'}}>
                <CameraIcon />
              </div>
              <div>
                <input className='center gray60 input-inline mt4 f-xxl semibold' type='text' id='name' placeholder='Campaign Name' size={name.length > 0 ? name.length + 2 : 15} value={name} />
              </div>
              <div>
                <input className='center gray60 input-inline mt1 f-lg gray10' type='text' id='client' placeholder='Client' />
              </div>
            </div>
            <div className='bg-gray90 border-top border-gray80'>
              <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Details</label>
              <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
                <div className='pt3'>
                  <BioIcon style={iconStyle} className='inline-block align-top' />
                  <div className='inline-block align-middle'>
                    <textarea style={inputStyle} className='textarea' type='text' rows='5' placeholder='Key Message' />
                  </div>
                </div>
                <div className='pt3'>
                  <WebsiteIcon style={iconStyle} className='inline-block align-top' />
                  <div className='inline-block align-middle'>
                    <input style={inputStyle} className='input' type='text' placeholder='Website' />
                  </div>
                </div>
              </div>
            </div>
            <div className='p4 right'>
              <button className='btn bg-completed white right' onClick={this.onSubmit}>Create Campaign</button>
              <button className='btn bg-transparent gray40 right mr2' onClick={onDismiss}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  Meteor.subscribe('clients')
  const clients = Clients.find().fetch()
  return { clients }
}, CampaignModal)
