import React, { PropTypes } from 'react'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import StatusLabel from './status-label'
import { StatusValues } from '/imports/api/contacts/status'

const StatusSelector = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    status: PropTypes.string,
    border: PropTypes.bool,
    chevron: PropTypes.bool,
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
    const { status, border, chevron, disabled } = this.props
    const style = {
      height: 34,
      borderRadius: 2,
      paddingTop: 6
    }
    return (
      <div className='inline-block'>
        <Dropdown>
          { status ? (
            <button className={`btn ml3 bg-transparent ${border ? 'border-gray80' : ''}`} onClick={this.openDropdown} style={style}>
              <StatusLabel name={status} chevron={chevron} />
            </button>
        ) : (
          <button className='btn ml3 bg-transparent border-gray80' onClick={this.openDropdown} disabled={disabled} style={style}>
            Select status
          </button>
        )}
          <DropdownMenu width={223} open={this.state.open} onDismiss={this.closeDropdown}>
            <nav className='py3'>
              {StatusValues.map((item) => (
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
