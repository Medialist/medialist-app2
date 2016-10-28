import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { CameraIcon } from '../images/icons'

export default React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },
  render () {
    const { open, onDismiss } = this.props
    const htmlStyle = open ? 'height:100%; overflow:hidden' : ''
    if (!open) return null
    return (
      <div>
        <Helmet htmlAttributes={{ style: htmlStyle }} />
        <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={onDismiss} />
        <div className='absolute top-0 right-0 left-0 bg-white fit mx-auto mt6' style={{width: 675}}>
          <div className='inline-block right pointer f-xxl mx2 gray60 hover-blue' onClick={onDismiss}>&times;</div>
          <div className='p4'>
            <div className='bg-gray40 center rounded mx-auto' style={{height: '100px', width: '100px', lineHeight: '100px'}}><CameraIcon /></div>
          </div>
        </div>
      </div>
    )
  }
})
