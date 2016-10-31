import React, { PropTypes } from 'react'
import values from 'lodash.values'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'

const items = values(window.Contacts.status)

const Status = (props) => {
  const ref = props.name.toLowerCase().replace(' ', '-')
  const className = `inline-block align-middle circle bg-${ref}`
  return (
    <div>
      <span className={className} style={{width: 12, height: 12}} />
      <span className='ml2 uppercase f-xxs semibold gray20 letter-spacing-1'>{props.name}</span>
    </div>
  )
}

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    status: PropTypes.object
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
          <DropdownMenu right style={{ width: 223 }} open={this.state.open} onDismiss={this.closeDropdown}>
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
