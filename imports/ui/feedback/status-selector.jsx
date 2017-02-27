import React, { PropTypes } from 'react'
import { StatusValues } from '/imports/api/contacts/status'
import { Check, ChevronDown } from '../images/icons'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import StatusLabel from './status-label'

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
    const style = {
      height: 34,
      borderRadius: 2,
      paddingTop: 6
    }
    return (
      <div className='inline-block'>
        <Dropdown>
          { status ? (
            <button className={`btn text-left bg-transparent ${border ? 'border-gray80' : ''}`} onClick={this.openDropdown} style={style}>
              <StatusLabel name={status} className='inline-block' />
              <ChevronDown className='ml1 gray40' />
            </button>
        ) : (
          <button className='btn ml3 bg-transparent border-gray80' onClick={this.openDropdown} disabled={disabled} style={style}>
            Select status
            <ChevronDown className='ml1 gray40' />
          </button>
        )}
          <DropdownMenu width={223} open={this.state.open} onDismiss={this.closeDropdown}>
            <nav className='py3'>
              {StatusValues.map((item) => (
                <StatusItem
                  selected={status === item}
                  status={item}
                  onClick={() => this.onLinkClick(item)}
                />
              ))}
            </nav>
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
})

export const StatusItem = ({selected, status, onClick}) => (
  <div className='flex px3 py2 pointer hover-bg-gray90' onClick={onClick}>
    <StatusLabel
      name={status}
      className={`flex-auto ${selected ? 'gray10 semibold' : 'gray20'}`}
    />
    { selected && <Check className='flex-none blue' /> }
  </div>
)

export default StatusSelector
