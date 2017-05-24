import React from 'react'
import PropTypes from 'prop-types'
import dasherise from 'dasherize'
import { Dropdown, DropdownMenu, DropdownMenuItem } from '/imports/ui/navigation/dropdown'
import { StatusValues } from '/imports/api/contacts/status'
import StatusLabel from '/imports/ui/feedback/status-label'
import { ChevronDown } from '/imports/ui/images/icons'
import { GREY40 } from '/imports/ui/colours'

class StatusSelector extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.state = {
      open: false
    }
  }

  onLinkClick (event, status) {
    event.preventDefault()
    event.stopPropagation()

    this.props.onChange({
      target: {
        name: 'status',
        value: status
      }
    })

    this.closeDropdown(event)
  }

  openDropdown (event) {
    event.preventDefault()
    event.stopPropagation()

    this.setState({
      open: true
    })
  }

  closeDropdown (event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    this.setState({
      open: false
    })
  }

  render () {
    const dropdown = {
      left: this.props.dropdown.left || 0,
      width: this.props.dropdown.width || 223,
      arrowAlign: this.props.dropdown.arrowAlign || 'left'
    }

    if (dropdown.arrowAlign === 'left') {
      dropdown.arrowMarginLeft = this.props.dropdown.arrowMarginLeft || (this.props.compact ? '15px' : '60px')
    }

    if (dropdown.arrowAlign === 'right') {
      dropdown.arrowMarginRight = this.props.dropdown.arrowMarginRight || (this.props.compact ? '15px' : '60px')
    }

    return (
      <Dropdown>
        <button
          style={{padding: '0 10px'}}
          className={this.props.buttonClassName || 'btn bg-transparent border-gray80'}
          onClick={(event) => this.openDropdown(event)}
          disabled={this.props.disabled}
          data-id='contact-status-selector-button'>
          <StatusLabel name={this.props.status} compact={this.props.compact} />
          <ChevronDown className='gray40' style={{fill: GREY40, marginLeft: '5px'}} />
        </button>
        <DropdownMenu
          left={dropdown.left}
          width={dropdown.width}
          arrowAlign={dropdown.arrowAlign}
          arrowMarginLeft={dropdown.arrowMarginLeft}
          arrowMarginRight={dropdown.arrowMarginRight}
          open={this.state.open}
          onDismiss={(event) => this.closeDropdown(event)}>
          {StatusValues.map((item) => (
            <DropdownMenuItem
              key={item}
              selected={item === this.props.status}
              onClick={(event) => this.onLinkClick(event, item)}
              data-id={`contact-status-${dasherise(item).replace(/\s/g, '')}`}>
              <StatusLabel name={item} className={`${item === this.props.status ? 'gray10 semibold' : 'gray20'}`} />
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    )
  }
}

StatusSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  buttonClassName: PropTypes.string,
  compact: PropTypes.bool,
  dropdown: PropTypes.shape({
    left: PropTypes.number,
    width: PropTypes.number,
    arrowAlign: PropTypes.string,
    arrowMarginRight: PropTypes.string,
    arrowMarginLeft: PropTypes.string
  })
}

StatusSelector.defaultProps = {
  dropdown: {}
}

export default StatusSelector
