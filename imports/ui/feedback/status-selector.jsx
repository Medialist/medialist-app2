import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'

const items = [
  'To contact',
  'Contacted',
  'Hot lead',
  'Completed',
  'Not interested'
]

const Status = (props) => {
  const ref = props.name.toLowerCase().replace(' ', '-')
  const className = `inline-block circle bg-${ref}`
  return (
    <div>
      <span className={className} style={{width: 12, height: 12}} />
      <span className='ml2'>{props.name}</span>
    </div>
  )
}

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    return {open: false, status: null}
  },
  openDropdown () {
    this.setState({open: true})
  },
  closeDropdown () {
    this.setState({open: false})
  },
  onLinkClick (status) {
    this.setState({open: false, status: status})
    this.props.onChange(status)
  },
  render () {
    const { status } = this.state
    return (
      <div className='inline-block'>
        <Dropdown>
          <button className='btn bg-transparent border-gray80 mx2' onClick={this.openDropdown}>
            { status ? <Status name={status} /> : 'Select status' }
          </button>
          <DropdownMenu right style={{ width: 223 }} open={this.state.open} onDismiss={this.closeDropdown}>
            <nav className='py3'>
              {items.map((item) => (
                <div key={item} className='px3 py2 pointer uppercase f-xxs semibold gray20 letter-spacing-1 hover-bg-gray90' onClick={() => this.onLinkClick(item)}>
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
