import React, { PropTypes } from 'react'
import { SortableIcon, SortedAscIcon, SortedDescIcon } from '../images/icons'
import classnames from 'classnames/dedupe'

const SortableHeader = React.createClass({
  propTypes: {
    sortDirection: PropTypes.number,
    onSortChange: PropTypes.func.isRequired,
    className: PropTypes.string
  },

  getDefaultProps () {
    return { sortable: true }
  },

  onClick () {
    const { sortDirection, onSortChange } = this.props
    onSortChange(sortDirection > 0 ? -1 : 1)
  },

  getClassName () {
    const { className, sortDirection } = this.props
    return classnames(className, {
      sortable: true,
      'sorted-asc': sortDirection > 0,
      'sorted-desc': sortDirection < 0
    })
  },

  render () {
    const { children, sortDirection } = this.props

    return (
      <th className={this.getClassName()} onClick={this.onClick}>
        <span className='mr1'>{children}</span>
        <SortIcon direction={sortDirection} />
      </th>
    )
  }
})

const SortIcon = ({ direction }) => {
  if (!direction) return <SortableIcon />
  if (direction > 0) return <SortedAscIcon />
  if (direction < 0) return <SortedDescIcon />
}

export default SortableHeader
