import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { CameraIcon, BioIcon, WebsiteIcon } from '../images/icons'

const emptyFormData = {
  name: '',
  purpose: '',
  clientName: '',
  website: ''
}

export default React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired
  },
  getInitialState () {
    return { formData: emptyFormData }
  },
  onChange (evt) {
    const formData = Object.assign(this.state.formData, { [evt.target.name]: evt.target.value }, {})
    this.setState({ formData })
  },
  autoComplete (evt) {
    console.log(this.state.clients)
  },
  onSubmit (evt) {
    evt.preventDefault()
    this.props.onDismiss()
    this.setState({ formData: emptyFormData })

    const payload = {
      name: this.state.formData.name,
      purpose: this.state.formData.purpose,
      client: {
        name: this.state.formData.clientName
      }
    }

    this.props.onSubmit(payload)
  },
  render () {
    const { open, onDismiss } = this.props
    const htmlStyle = open ? 'height:100%; overflow:hidden' : ''

    if (!open) return null

    const inputWidth = 270
    const iconWidth = 30
    const inputStyle = { width: inputWidth, resize: 'none' }
    const iconStyle = { width: iconWidth }

    const formData = this.state.formData

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
                <input className='center gray60 input-inline mt4 f-xxl semibold' type='text' name='name' placeholder='Campaign Name' size={formData.name.length > 0 ? formData.name.length + 2 : 15} />
              </div>
              <div>
                <input className='center gray60 input-inline mt1 f-lg gray10' type='text' name='clientName' placeholder='Client' size={formData.clientName.length > 0 ? formData.clientName.length + 2 : 8} />
              </div>
            </div>
            <div className='bg-gray90 border-top border-gray80'>
              <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Details</label>
              <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
                <div className='pt3'>
                  <BioIcon style={iconStyle} className='inline-block align-top' />
                  <div className='inline-block align-middle'>
                    <textarea style={inputStyle} className='textarea' type='text' rows='5' name='purpose' placeholder='Key Message' />
                  </div>
                </div>
                <div className='pt3'>
                  <WebsiteIcon style={iconStyle} className='inline-block align-top' />
                  <div className='inline-block align-middle'>
                    <input style={inputStyle} className='input' type='text' name='website' placeholder='Website' />
                  </div>
                </div>
              </div>
            </div>
            <div className='p4 right'>
              <button className='btn bg-completed white right' type='submit' onClick={this.onSubmit}>Create Campaign</button>
              <button className='btn bg-transparent gray40 right mr2' type='reset' onClick={onDismiss}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
})
