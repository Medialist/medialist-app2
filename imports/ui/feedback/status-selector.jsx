import React, { PropTypes } from 'react'
import values from 'lodash.values'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import { dropdownMenuStyle } from '../common-styles'
import StatusLabel from './status-label'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { width: 223 })

const items = values(window.Contacts.status)

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    status: PropTypes.string,
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
  onLinkClick (status) {
    this.setState({open: false})
    this.props.onChange(status)
  },
  render () {
    const { status, border, disabled } = this.props
    return (
      <div className='inline-block'>
        <Dropdown>
          { status ? (
            <button className={`btn bg-transparent ${border ? 'border-gray80' : ''}`} onClick={this.openDropdown}>
              <StatusLabel name={status} />
            </button>
        ) : (
          <button className='btn bg-transparent border-gray80' onClick={this.openDropdown} disabled={disabled}>
            Select status
          </button>
        )}
          <DropdownMenu right style={dropdownStyle} open={this.state.open} onDismiss={this.closeDropdown}>
            <nav className='py3'>
              {items.map((item) => (
                <div key={item} className='px3 py2 pointer hover-bg-gray90' onClick={() => this.onLinkClick(item)}>
                  <StatusLabel name={item} />
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
