import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { CircleAvatar } from '../images/avatar'
import { EmailIcon, PhoneIcon, AddressIcon } from '../images/icons'

const EditContact = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    toggle: PropTypes.func.isRequired
  },
  render () {
    const { open, contact, toggle } = this.props
    if (!contact || !open) return null
    const { avatar, name, jobTitles, primaryOutlets } = contact
    const scrollableHeight = window.innerHeight - 396
    const inputWidth = 270
    const iconWidth = 30
    const inputStyle = { width: inputWidth }
    const iconStyle = { width: iconWidth }
    const linkStyle = { marginLeft: iconWidth }
    // Prevent scrolling of the page when modal is open. Modal has internal scrollable section
    const htmlStyle = open ? 'height:100%; overflow:hidden' : ''
    return (
      <div>
        <Helmet htmlAttributes={{ style: htmlStyle }} />
        <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={toggle} />
        <div className='absolute top-0 right-0 left-0 bg-white fit mx-auto' style={{width: 675}}>
          <div className='inline-block right pointer f-xxl mx2 gray60 hover-blue' onClick={toggle}>&times;</div>
          <div className='py6 center'>
            <CircleAvatar size={110} avatar={avatar} name={name} />
            <div>
              <input className='center input-inline mt4 f-xxl semibold' type='text' value={name} size={name.length + 2} />
            </div>
            <div>
              <input className='center input-inline mt1 f-lg gray10' type='text' value={jobTitles} size={jobTitles.length + 2} />
            </div>
            <div>
              <input className='center input-inline mt1 f-lg gray10' type='text' value={primaryOutlets} size={primaryOutlets.length + 2} />
            </div>
          </div>
          <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
            <div className='bg-gray90 border-top border-gray80'>
              <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Details</label>
              <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
                <div className='pt3'>
                  <EmailIcon style={iconStyle} className='inline-block' />
                  <div className='inline-block'>
                    <input style={inputStyle} className='input' type='text' value='' placeholder='Email' />
                  </div>
                </div>
                <div className='py2' style={linkStyle}>
                  <span className='inline-block blue f-xs underline'>Add new email</span>
                </div>
                <div className='pt3'>
                  <PhoneIcon style={iconStyle} className='inline-block' />
                  <div className='inline-block'>
                    <input style={inputStyle} className='input' type='text' value='' placeholder='Phone number' />
                  </div>
                </div>
                <div className='py2' style={linkStyle}>
                  <span className='inline-block blue f-xs underline'>Add new phone number</span>
                </div>
              </div>
            </div>
            <div className='bg-gray90 border-top border-gray80'>
              <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Social</label>
              <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
                <div className='pt3'>
                  <EmailIcon style={iconStyle} className='inline-block' />
                  <div className='inline-block'>
                    <input style={inputStyle} className='input' type='text' value='' placeholder='Enter social or website url' />
                  </div>
                </div>
                <div className='py2' style={linkStyle}>
                  <span className='inline-block blue f-xs underline'>Add new social or website</span>
                </div>
              </div>
            </div>
            <div className='bg-gray90 border-top border-gray80 pb6'>
              <label className='xs-hide left gray40 semibold f-sm mt4' style={{marginLeft: 70}}>Address</label>
              <div className='mx-auto py2' style={{width: inputWidth + iconWidth}}>
                <div className='pt3'>
                  <AddressIcon style={iconStyle} className='inline-block' />
                  <div className='inline-block'>
                    <input style={inputStyle} className='input' type='text' value='' placeholder='Street' />
                  </div>
                </div>
                <div className='pt3'>
                  <AddressIcon style={iconStyle} className='inline-block invisible' />
                  <div className='inline-block'>
                    <input style={inputStyle} className='input' type='text' value='' placeholder='City' />
                  </div>
                </div>
                <div className='pt3'>
                  <AddressIcon style={iconStyle} className='inline-block invisible' />
                  <div className='inline-block'>
                    <input style={inputStyle} className='input' type='text' value='' placeholder='Postcode' />
                  </div>
                </div>
                <div className='pt3'>
                  <AddressIcon style={iconStyle} className='inline-block invisible' />
                  <div className='inline-block'>
                    <input style={inputStyle} className='input' type='text' value='' placeholder='Country' />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='p4 bg-white'>
            <button className='btn bg-completed white right'>Save Changes</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={toggle}>Cancel</button>
            <button className='btn bg-transparent not-interested'>Delete Contact</button>
          </div>
        </div>
      </div>
    )
  }
})

export default EditContact
