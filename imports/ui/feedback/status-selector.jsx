import React, { PropTypes } from 'react'
import { Select, Option } from '../navigation/select'
import { StatusValues } from '/imports/api/contacts/status'
import StatusLabel from './status-label'
import StatusDot from './status-dot'

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    status: PropTypes.string,
    border: PropTypes.bool,
    disabled: PropTypes.bool,
    hideLabel: PropTypes.bool
  },
  onLinkClick (status) {
    this.props.onChange(status)
  },
  render () {
    const { status, border, disabled, className, hideLabel } = this.props
    return (
      <Select
        className={className}
        border={border}
        disabled={disabled}
        buttonText={
          hideLabel
          ? <StatusDot name={status} />
          : <StatusLabel name={status} className='inline-block' />
        }
      >
        {StatusValues.map((item) => (
          <Option selected={item === status} onClick={() => this.onLinkClick(item)}>
            <StatusLabel name={item} className={`${item === status ? 'gray10 semibold' : 'gray20'}`} />
          </Option>
        ))}
      </Select>
    )
  }
})

export default StatusSelector
