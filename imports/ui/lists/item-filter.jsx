import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import classnames from 'classnames'
import { dropdownMenuStyle } from '../common-styles'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { width: 180 })

// A general filtering component for lists
const ItemFilter = React.createClass({
  propTypes: {
    // The currently selected filter (a renderable react component)
    filter: PropTypes.func.isRequired,
    // All possible filters to select from
    filters: PropTypes.arrayOf(PropTypes.func).isRequired,
    // Callback when filter is changed
    onChange: PropTypes.func.isRequired
  },

  getInitialState () {
    return { isDropdownOpen: false }
  },

  onButtonClick () {
    this.setState({ isDropdownOpen: true })
  },

  onDropdownDismiss () {
    this.setState({ isDropdownOpen: false })
  },

  onFilterClick (filter, i) {
    this.setState({ isDropdownOpen: false })
    this.props.onChange(filter, i)
  },

  render () {
    const { filter: CurrentFilter, filters } = this.props
    return (
      <Dropdown className='inline-block'>
        <div className='flex pointer fm-sm semibold gray20' onClick={this.onButtonClick}>
          <div className='flex-none p3 f-sm'>
            <CurrentFilter />
          </div>
          <hr className='flex-auto' style={{height: 1, margin: '25px 0 0 0'}} />
        </div>
        <DropdownMenu left open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss} style={dropdownStyle}>
          <nav>
            {filters.map((Filter, i) => {
              const isActive = Filter === CurrentFilter
              const className = classnames('pointer px3 py2 f-md normal gray20 hover-bg-blue', {active: isActive})
              return (
                <div onClick={() => this.onFilterClick(Filter, i)} className={className} key={i}>
                  <Filter />
                </div>
              )
            })}
          </nav>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default ItemFilter
