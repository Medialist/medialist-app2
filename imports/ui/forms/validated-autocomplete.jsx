import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
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
      activeInd: 0,
      lastValue: null
    }
  },
  componentWillReceiveProps (props) {
    // no text entered or we have no suggestions
    if (!this.props.value || !props.suggestions.length) {
      this.setState({
        activeInd: 0,
        lastValue: null
      })

      return
    }

    const lastIndex = this.state.activeInd
    const lastValue = this.state.lastValue

    let newIndex = lastIndex
    let newValue = lastValue

    // if we had previously selected a value, make sure it is still selected
    if (lastValue !== props.suggestions[newIndex]) {
      const lastValueIndex = props.suggestions.indexOf(lastValue)

      if (lastValueIndex !== -1) {
        newIndex = lastValueIndex
      }
    }

    // if the last thing selected was at the end of the list and the list
    // has got shorter, select the thing at the end of the list
    if (newIndex > (props.suggestions.length - 1)) {
      newIndex = props.suggestions.length - 1
      newValue = props.suggestions[newIndex]
    }

    this.setState({
      activeInd: newIndex,
      lastValue: newValue
    })
  },
  onBlur () {
    this.setState({
      open: false,
      activeInd: 0,
      lastValue: null
    }, this.props.onBlur)
  },
  onChange (event) {
    this.props.onChange(event)

    this.setState({
      open: !!this.props.suggestions.length
    })
  },
  onSelect (value) {
    const {name, onSelect} = this.props
    onSelect({name, value})
  },
  onKeyDown (event) {
    const { key } = event

    if (!this.props.suggestions.length) {
      return
    }

    const { suggestions } = this.props
    const { open, activeInd } = this.state

    switch (key) {
      case 'ArrowDown':
        if (!open) {
          return this.setState({open: true})
        }

        if (activeInd == null) {
          return this.setState({
            activeInd: 0,
            lastValue: suggestions[0]
          })
        }

        if (activeInd < suggestions.length - 1) {
          this.setState({
            activeInd: activeInd + 1,
            lastValue: suggestions[activeInd + 1]
          })
        }

        if (open) {
          event.preventDefault()
        }

        break

      case 'ArrowUp':
        if (activeInd > 0) {
          this.setState({
            activeInd: activeInd - 1,
            lastValue: suggestions[activeInd - 1]
          })
        }

        if (open) {
          event.preventDefault()
        }

        break

      case 'Escape':
        this.setState({
          open: false
        })

        break

      case 'Tab':
      case 'Enter':
        if (open) {
          event.preventDefault()
        }

        this.onSelect(suggestions[activeInd])
        this.setState({
          open: false,
          activeInd: 0,
          lastValue: null
        })
    }
  },
  onDismiss () {
    this.setState({
      open: false,
      activeInd: 0,
      lastValue: null
    })
  },
  onClick (suggestion) {
    this.onSelect(suggestion)
    this.setState({
      open: false,
      activeInd: 0,
      lastValue: null
    })
  },
  onActivate (ind) {
    this.setState({
      activeInd: ind,
      lastValue: this.props.suggestions[ind]
    })
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
                onMouseDown={() => onClick(suggestion)}
                data-id={`${this.props['data-id']}-suggestion-${index}`}>
                {suggestion}
              </li>
            )
          })}</ol>
        </DropdownMenu>
      </Dropdown>
    )
  }
})
