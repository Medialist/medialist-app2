import React, { PropTypes } from 'react'
import values from 'lodash.values'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import { dropdownMenuStyle } from '../common-styles'
import StatusDot from './status-dot'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { width: 223 })

const items = values(window.Contacts.status)

const Status = (props) => {
  return (
    <div>
      <StatusDot name={props.name} />
      <span className='ml2 uppercase f-xxs semibold gray20 letter-spacing-1'>{props.name}</span>
    </div>
  )
}

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    status: PropTypes.string
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
  onLinkClick (status) {
    this.setState({open: false})
    this.props.onChange(status)
  },
  render () {
    const { status } = this.props
    return (
      <div className='inline-block'>
        <Dropdown>
          { status ? (
            <button className='btn bg-transparent' onClick={this.openDropdown}>
              <Status name={status} />
            </button>
        ) : (
          <button className='btn bg-transparent border-gray80' onClick={this.openDropdown}>
            Select status
          </button>
        )}
          <DropdownMenu right style={dropdownStyle} open={this.state.open} onDismiss={this.closeDropdown}>
            <nav className='py3'>
              {items.map((item) => (
                <div key={item} className='px3 py2 pointer hover-bg-gray90' onClick={() => this.onLinkClick(item)}>
                  <Status name={item} />
                </div>
              ))}
            </nav>
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
})

export default StatusSelector
