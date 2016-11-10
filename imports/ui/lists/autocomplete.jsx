import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'

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
  render () {
    const {
      className,
      name,
      value,
      placeholder,
      suggestions
    } = this.props
    const { onChange, onDismiss } = this
    const { open } = this.state
    return (
      <Dropdown>
        <input
          className={className}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          onChange={onChange} />
        <DropdownMenu open={open} onDismiss={onDismiss}>
          <ol className='list-reset'>{suggestions.map((s) => {
            return (
              <li className='block px3 py2 f-sm normal gray20 hover-bg-blue' key={s._id}>{s.name}</li>
              )
          })}</ol>
        </DropdownMenu>
      </Dropdown>
    )
  }
})
