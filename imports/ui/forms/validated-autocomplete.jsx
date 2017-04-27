import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { Input } from '@achingbrain/react-validation'

export default React.createClass({
  propTypes: {
    id: PropTypes.string,
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    suggestions: PropTypes.array.isRequired,
    menuWidth: PropTypes.number.isRequired,
    'data-id': PropTypes.string,
    validations: PropTypes.array.isRequired
  },
  getDefaultProps () {
    return {
      menuWidth: 200,
      validations: []
    }
  },
  getInitialState () {
    return {
      open: false,
      activeInd: 0
    }
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
      id,
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
        <Input
          type='text'
          style={style}
          className={className}
          errorClassName='error'
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={this.onBlur}
          id={id}
          data-id={this.props['data-id']}
          data-paired-with={this.props['data-paired-with']}
          validations={this.props.validations}
        />
        <DropdownMenu open={open} onDismiss={onDismiss} width={menuWidth} arrowHeight={0}>
          <ol className='list-reset m0'>{suggestions.map((suggestion, index) => {
            const activeClass = (activeInd === index) ? 'bg-blue white' : ''
            return (
              <li
                key={index.toString()}
                className={`block px3 py2 pointer left-align f-sm normal gray20 ${activeClass}`}
                onMouseOver={() => onActivate(index)}
                onMouseOut={() => onActivate(0)}
                onMouseDown={() => onClick(suggestion)}>
                {suggestion}
              </li>
            )
          })}</ol>
        </DropdownMenu>
      </Dropdown>
    )
  }
})
