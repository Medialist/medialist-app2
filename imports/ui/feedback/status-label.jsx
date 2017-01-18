import React, { PropTypes } from 'react'
import StatusDot from './status-dot'

const Status = (props) => {
  return (
    <div>
      <StatusDot name={props.name} />
      <span className='ml2 uppercase f-xxs semibold gray20 letter-spacing-1'>{props.name}</span>
    </div>
  )
}

Status.PropTypes = {
  name: PropTypes.string.isRequired
}

export default Status
