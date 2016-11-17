import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import { dropdownMenuStyle } from '../common-styles'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { maxWidth: 300 })

export default React.createClass({
  propTypes: {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    suggestions: PropTypes.array.isRequired
  },
  getInitialState () {
    return { open: false }
  },
  onChange (evt) {
    this.props.onChange(evt.target.value)
    this.setState({open: true})
  },
  onDismiss () {
    this.setState({open: false})
  },
  onClick (suggestion) {
    this.props.onSelect(suggestion)
    this.onDismiss()
  },
  render () {
    const {
      className,
      name,
      value,
      placeholder,
      suggestions
    } = this.props
    const { onChange, onDismiss, onClick } = this
    const { open } = this.state
    return (
      <Dropdown style={{display: 'inline-block'}}>
        <input
          className={className}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          onChange={onChange} />
        <DropdownMenu right open={open} onDismiss={onDismiss} style={dropdownStyle}>
          <ol className='list-reset'>{suggestions.map((s) => {
            return (
              <li key={s} className='block px3 py2 pointer left-align f-sm normal gray20 hover-bg-blue' onClick={() => onClick(s)}>
                {s}
              </li>
              )
          })}</ol>
        </DropdownMenu>
      </Dropdown>
    )
  }
})
