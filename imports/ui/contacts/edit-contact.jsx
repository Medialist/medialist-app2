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
    const { avatar, name } = contact
    return (
      <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}}>
        <div className='bg-white fit mx-auto my4' style={{width:675}}>
          <div className='inline-block right' onClick={toggle}>&times;</div>
          <div className='p4 center'>
            <CircleAvatar size={110} avatar={avatar} name={name} />
          </div>
        </div>
      </div>
    )
  }
})

export default EditContact