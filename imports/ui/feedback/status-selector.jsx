import React from 'react'
import PropTypes from 'prop-types'
import { Select, Option } from '/imports/ui/navigation/select'
import { StatusValues } from '/imports/api/contacts/status'
import StatusLabel from '/imports/ui/feedback/status-label'
import dasherise from 'dasherize'

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    status: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  },
  onLinkClick (event, status) {
    this.props.onChange({
      target: {
        name: 'status',
        value: status
      }
    })
  },
  render () {
    const { status, children, ...props } = this.props
    return (
      <Select
        {...props}
        buttonText={children}
        data-id='contact-status-selector-button'>
        {StatusValues.map((item) => (
          <Option
            key={item}
            selected={item === status}
            onClick={(evt) => this.onLinkClick(evt, item)}
            data-id={`contact-status-${dasherise(item).replace(/\s/g, '')}`}>
            <StatusLabel name={item} className={`${item === status ? 'gray10 semibold' : 'gray20'}`} />
          </Option>
        ))}
      </Select>
    )
  }
})

export default StatusSelector
