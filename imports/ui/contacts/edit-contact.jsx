import React, { PropTypes } from 'react'
import { CircleAvatar } from '../images/avatar'

const EditContact = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    return {open: false}
  },
  render () {
    const { open, contact } = this.props
    if (!contact) return null
    const { avatar, name } = contact
    if (!open) return null
    return (
      <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}}>
        <div className='bg-white fit mx-auto my4' style={{width:675}}>
          <div className='p4 center'>
            <CircleAvatar size={110} avatar={avatar} name={name} />
          </div>
        </div>
      </div>
    )
  }
})

export default EditContact