import React, { PropTypes } from 'react'
import { Select, Option } from '../navigation/select'
import { StatusValues } from '/imports/api/contacts/status'
import StatusLabel from './status-label'

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    status: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  },
  onLinkClick (evt, status) {
    this.props.onChange(status)
  },
  render () {
    const { status, children, ...props } = this.props
    return (
      <Select {...props} buttonText={children}>
        {StatusValues.map((item) => (
          <Option selected={item === status} onClick={(evt) => this.onLinkClick(evt, item)}>
            <StatusLabel name={item} className={`${item === status ? 'gray10 semibold' : 'gray20'}`} />
          </Option>
        ))}
      </Select>
    )
  }
})

export default StatusSelector
