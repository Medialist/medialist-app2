import React, { PropTypes } from 'react'
import { Check, ChevronDown } from '../images/icons'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'

export const Select = React.createClass({
  propTypes: {
    buttonText: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    border: PropTypes.bool,
    disabled: PropTypes.bool
  },
  getInitialState () {
    return {open: false}
  },
  openDropdown () {
    this.setState({open: true})
  },
  closeDropdown () {
    this.setState({open: false})
  },
  onOptionClick (status) {
    this.setState({open: false})
  },
  render () {
    const { border, disabled, buttonText, children, style, className } = this.props
    const attributes = {
      disabled,
      style,
      className: `btn bg-transparent ${border ? 'border-gray80' : ''} ${className}`,
      onClick: this.openDropdown
    }
    return (
      <Dropdown>
        <button {...attributes}>
          {buttonText}
          <ChevronDown className='ml1 gray40' />
        </button>
        <DropdownMenu width={223} open={this.state.open} onDismiss={this.closeDropdown}>
          <nav className='py3' onClick={this.closeDropdown}>
            {children}
          </nav>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export const Option = ({selected, onClick, children}) => (
  <div className='flex px3 py2 pointer hover-bg-gray90 hover-color-trigger' onClick={onClick}>
    <div className='flex-auto'>
      {children}
    </div>
    { selected && <Check className='flex-none blue' style={{transform: 'scale(1.5)'}} /> }
  </div>
)
