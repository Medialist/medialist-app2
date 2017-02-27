import React, { PropTypes } from 'react'
import StatusDot from './status-dot'

const Status = ({name, className, ...props}) => {
  const attributes = {
    className: className || 'gray20 semibold'
  }
  return (
    <div {...attributes} {...props}>
      <StatusDot name={name} />
      <span className='ml2 uppercase f-xxs letter-spacing-1'>{name}</span>
    </div>
  )
}

Status.PropTypes = {
  name: PropTypes.string.isRequired
}

export default Status
