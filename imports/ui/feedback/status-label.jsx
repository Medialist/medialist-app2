import React, { PropTypes } from 'react'
import StatusDot from './status-dot'
import { ChevronDown } from '../images/icons'

const Status = (props) => {
  const { name, chevron } = props
  return (
    <div>
      <StatusDot name={name} />
      <span className='ml2 uppercase f-xxs semibold gray20 letter-spacing-1'>{name}</span>
      {chevron && <ChevronDown className='ml1 gray40' />}
    </div>
  )
}

Status.PropTypes = {
  name: PropTypes.string.isRequired,
  chevron: PropTypes.bool
}

export default Status
