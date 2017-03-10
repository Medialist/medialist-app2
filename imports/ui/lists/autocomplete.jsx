import React, { PropTypes } from 'react'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'

export default React.createClass({
  propTypes: {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    suggestions: PropTypes.array.isRequired,
    menuWidth: PropTypes.number.isRequired
  },
  getDefaultProps () {
    return {
      menuWidth: 200
    }
  },
  getInitialState () {
    return { open: false, activeInd: 0 }
  },
  componentWillReceiveProps (props) {
    const { suggestions, value } = props
    this.setState({open: suggestions.length > 0 && suggestions[0] !== value})
  },
  onBlur () {
    this.setState({ open: false, activeInd: 0 }, this.props.onBlur)
  },
  onChange (evt) {
    this.props.onChange(evt)
    this.setState({open: true})
  },
  onSelect (value) {
    const {name, onSelect} = this.props
    onSelect({name, value})
  },
  onKeyDown (evt) {
    const { key } = evt
    if (!this.props.suggestions.length) return
    const { suggestions } = this.props
    const { open, activeInd } = this.state
    switch (key) {
      case 'ArrowDown':
        if (!open) return this.setState({open: true})
        if (activeInd == null) return this.setState({ activeInd: 0 })
        if (activeInd < suggestions.length - 1) this.setState({ activeInd: activeInd + 1 })
        break

      case 'ArrowUp':
        if (activeInd > 0) this.setState({ activeInd: activeInd - 1 })
        break

      case 'Tab':
      case 'Enter':
        if (open) evt.preventDefault()
        this.onSelect(suggestions[activeInd])
        this.setState({ open: false, activeInd: 0 })
    }
  },
  onDismiss () {
    this.setState({ open: false, activeInd: 0 })
  },
  onClick (suggestion) {
    this.onSelect(suggestion)
    this.setState({ open: false, activeInd: 0 })
  },
  onActivate (ind) {
    this.setState({ activeInd: ind })
  },
  render () {
    const {
      style,
      className,
      name,
      value,
      placeholder,
      suggestions,
      onFocus,
      menuWidth
    } = this.props
    const { onChange, onDismiss, onClick, onKeyDown, onActivate } = this
    const { open, activeInd } = this.state
    return (
      <Dropdown>
        <input
          type='text'
          style={style}
          className={className}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={this.onBlur}
        />
        <DropdownMenu open={open} onDismiss={onDismiss} width={menuWidth} arrowHeight={0}>
          <ol className='list-reset m0'>{suggestions.map((s, ind) => {
            const activeClass = (activeInd === ind) ? 'bg-blue white' : ''
            return (
              <li
                key={s}
                className={`block px3 py2 pointer left-align f-sm normal gray20 ${activeClass}`}
                onMouseOver={() => onActivate(ind)}
                onMouseOut={() => onActivate(0)}
                onMouseDown={() => onClick(s)}>
                {s}
              </li>
            )
          })}</ol>
        </DropdownMenu>
      </Dropdown>
    )
  }
})
