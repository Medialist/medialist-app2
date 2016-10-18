import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import Button from 'rebass/dist/Button'

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
      <Dropdown>
        <Button backgroundColor='transparent' color='black' onClick={this.onButtonClick}><CurrentFilter /></Button>
        <DropdownMenu open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
          <ul>
            {filters.map((Filter, i) => {
              const className = Filter === CurrentFilter ? 'active' : ''
              return (
                <li onClick={() => this.onFilterClick(Filter, i)} className={className} key={i}>
                  <Filter />
                </li>
              )
            })}
          </ul>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default ItemFilter
