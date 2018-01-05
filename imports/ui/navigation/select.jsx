import React from 'react'
import PropTypes from 'prop-types'
import { Check, ChevronDown } from '/imports/ui/images/icons'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'

export class Select extends React.Component {
  static propTypes = {
    buttonText: PropTypes.node.isRequired,
    children: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    'data-id': PropTypes.string,
    alignRight: PropTypes.bool,
    arrowPosition: PropTypes.string
  }
  state = {
    open: false
  }
  openDropdown = () => {
    this.setState({open: true})
  }
  closeDropdown = () => {
    this.setState({open: false})
  }
  render () {
    const { open } = this.state
    const { disabled, buttonText, children, style, className, width = 223, top, alignRight, arrowPosition, hideChevron } = this.props
    return (
      <Dropdown>
        <div className={className} style={style} onClick={this.openDropdown} disabled={disabled} data-id={this.props['data-id']}>
          {buttonText}{hideChevron ? null : <ChevronDown className={`ml1 ${open ? 'blue' : 'gray40'}`} />}
        </div>
        <DropdownMenu width={width} open={open} onDismiss={this.closeDropdown} alignRight={alignRight} arrowPosition={arrowPosition} top={top}>
          {children(this.closeDropdown)}
        </DropdownMenu>
      </Dropdown>
    )
  }
}

export const Option = ({selected, onClick, children, ...props}) => (
  <div className='flex items-center px3 py2 pointer hover-bg-gray90 hover-color-trigger hover-box-shadow-x-gray80' onClick={onClick} data-id={props['data-id']} {...props}>
    <div className='flex-auto truncate'>
      {children}
    </div>
    { selected && <Check className='flex-none blue-dark' style={{transform: 'scale(1.5)'}} svgStyle={{verticalAlign: 'top'}} /> }
  </div>
)
