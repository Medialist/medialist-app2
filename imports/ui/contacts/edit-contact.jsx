import React, { PropTypes } from 'react'
import { CircleAvatar } from '../images/avatar'

const EditContact = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    toggle: PropTypes.func.isRequired
  },
  render () {
    const { open, contact, toggle } = this.props
    if (!contact || !open ) return null
    const { avatar, name, jobTitles, primaryOutlets } = contact
    return (
      <div>
        <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={toggle} />
        <div className='absolute top-0 right-0 left-0 bg-white fit mx-auto my4' style={{width: 675, height: '95vh'}}>
          <div className='inline-block right pointer f-xxl mx2 gray60 hover-blue' onClick={toggle}>&times;</div>
          <div className='p4 center'>
            <CircleAvatar size={110} avatar={avatar} name={name} />
            <div>
              <input className='input-inline inline-block mt4 f-xxl semibold' type='text' value={name} />
            </div>
            <div>
              <input className='input-inline inline-block mt1 f-lg' type='text' value={jobTitles} />
            </div>
            <div>
              <input className='input-inline inline-block mt1 f-lg' type='text' value={primaryOutlets} />
            </div>
          </div>
          <div className='bg-gray90 border-top border-gray80 py4'>
            <label className='left gray40 semibold f-sm mt4' style={{marginLeft:70}}>Details</label>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Email' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <span className='inline-block blue f-xs underline mt3 ml4'>Add secondary email</span>
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Landline' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Mobile' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <span className='inline-block blue f-xs underline mt3 ml4'>Add new phone number</span>
            </div>
          </div>
          <div className='bg-gray90 border-top border-gray80 py4'>
            <label className='left gray40 semibold f-sm mt4' style={{marginLeft:70}}>Social</label>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Website' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Twitter' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Facebook' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <span className='inline-block blue f-xs underline mt3 ml4'>Add new social or website</span>
            </div>
          </div>
          <div className='bg-gray90 border-top border-gray80 py4'>
            <label className='left gray40 semibold f-sm mt4' style={{marginLeft:70}}>Address</label>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Street' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='City' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mx4' type='text' value='' placeholder='Postcode' />
            </div>
            <div className='mx-auto' style={{width: 300}}>
              <input className='input mt3 mb4 mx4' type='text' value='' placeholder='Country' />
            </div>
          </div>
          <div className='p4 bg-white'>
            <button className='btn bg-completed white right'>Save Changes</button>
            <button className='btn bg-transparent gray40 right mr2'>Cancel</button>
            <button className='btn bg-transparent not-interested'>Delete Contact</button>
          </div>
        </div>
      </div>
    )
  }
})

export default EditContact