import React from 'react'
import PropTypes from 'prop-types'
import { Check, ChevronDown } from '/imports/ui/images/icons'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'

export const Select = React.createClass({
  propTypes: {
    buttonText: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    'data-id': PropTypes.string
  },
  getInitialState () {
    return {open: false}
  },
  openDropdown (evt) {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState({open: true})
  },
  closeDropdown (evt) {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState({open: false})
  },
  render () {
    const { open } = this.state
    const { disabled, buttonText, children, style, className } = this.props
    return (
      <Dropdown>
        <div className={className} style={style} onClick={this.openDropdown} disabled={disabled} data-id={this.props['data-id']}>
          {buttonText}<ChevronDown className={`${open ? 'blue' : 'gray40'}`} />
        </div>
        <DropdownMenu width={223} open={open} onDismiss={this.closeDropdown}>
          <nav className='py3' onClick={this.closeDropdown}>
            {children}
          </nav>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export const Option = ({selected, onClick, children, ...props}) => (
  <div className='flex px3 py2 pointer hover-bg-gray90 hover-color-trigger hover-box-shadow-x-gray80' onClick={onClick} data-id={props['data-id']}>
    <div className='flex-auto'>
      {children}
    </div>
    { selected && <Check className='flex-none blue' style={{transform: 'scale(1.5)'}} /> }
  </div>
)
