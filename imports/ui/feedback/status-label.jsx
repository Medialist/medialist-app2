import React from 'react'
import PropTypes from 'prop-types'
import StatusDot from '/imports/ui/feedback/status-dot'

const Status = ({name, className, ...props}) => {
  const attributes = {
    className: className || 'gray20 semibold inline-block'
  }
  const compact = props.compact
  delete props.compact
  return (
    <div {...attributes} {...props}>
      <StatusDot name={name} />
      {!compact && <span className='ml2 uppercase f-xxs letter-spacing-1'>{name}</span>}
    </div>
  )
}

Status.PropTypes = {
  name: PropTypes.string.isRequired,
  compact: PropTypes.bool
}

export default Status
