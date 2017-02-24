import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from '../lists/dropdown-menu'
import { AllTypesIcon, FeedCoverageIcon, FeedNeedToKnowIcon, ChevronDown } from '../images/icons'

const dropdownStyle = { width: 180 }

const iconMap = {
  'Top Activity': AllTypesIcon,
  'Coverage': FeedCoverageIcon,
  'Need To Know': FeedNeedToKnowIcon
}

const filterNames = Object.keys(iconMap)

const Filter = ({name, selected, onClick}) => {
  const Icon = iconMap[name]
  return (
    <div className='px3 py2 pointer gray20 hover-bg-blue hover-color-trigger' onClick={onClick}>
      <Icon className='gray60 hover-white' />
      <span className={`ml2 gray20 hover-white ${selected ? 'semibold' : 'regular'}`}>{name}</span>
    </div>
  )
}

const ActivityFilter = React.createClass({
  propTypes: {
    selected: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    return { open: false }
  },
  toggleDropdown () {
    const open = !this.state.open
    this.setState({open})
  },
  closeDropdown () {
    this.setState({open: false})
  },
  onLinkClick (filterName) {
    this.setState({open: false, selected: filterName})
    this.props.onChange(filterName)
  },
  render () {
    const { toggleDropdown } = this
    const { open } = this.state
    const { selected } = this.props
    return (
      <Dropdown>
        <div className='flex-none p3 pointer' onClick={toggleDropdown}>
          <span className={`f-sm semibold ${open ? 'blue' : 'gray20'}`}>
            {selected}
            <ChevronDown />
          </span>
          <DropdownMenu arrowPosition={'30%'} style={dropdownStyle} open={open} onDismiss={toggleDropdown}>
            <nav className='py1'>
              {filterNames.map((filterName) => (
                <Filter key={filterName} name={filterName} selected={filterName === selected} onClick={() => this.onLinkClick(filterName)} />)
              )}
            </nav>
          </DropdownMenu>
        </div>
      </Dropdown>
    )
  }
})

export default ActivityFilter
