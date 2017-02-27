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
    const { status, hideLabel, ...props } = this.props
    return (
      <Select
        {...props}
        style={{padding: '6px 15px 7px'}}
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
