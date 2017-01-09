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
  componentWillReceiveProps (props) {
    const { suggestions, value } = props
    this.setState({open: suggestions.length > 0 && suggestions[0] !== value})
  },
  onChange (evt) {
    this.props.onChange(evt.target.value)
    this.setState({open: true})
  },
  onKeyDown (evt) {
    const { key } = evt
    if (key !== 'ArrowDown') return
    this.setState({open: true})
  },
  onDismiss () {
    this.setState({open: false})
  },
  onClick (suggestion) {
    this.props.onSelect(suggestion)
  },
  render () {
    const {
      className,
      name,
      value,
      placeholder,
      suggestions
    } = this.props
    const { onChange, onDismiss, onClick, onKeyDown } = this
    const { open } = this.state
    return (
      <Dropdown style={{display: 'inline-block'}}>
        <input
          type='text'
          className={className}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
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
