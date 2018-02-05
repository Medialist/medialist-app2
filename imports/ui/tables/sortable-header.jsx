import React from 'react'
import PropTypes from 'prop-types'
import { SortableIcon, SortedAscIcon, SortedDescIcon } from '/imports/ui/images/icons'
import classnames from 'classnames/dedupe'

const SortableHeader = React.createClass({
  propTypes: {
    sortDirection: PropTypes.number,
    onSortChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    sortable: PropTypes.bool
  },

  getDefaultProps () {
    return { sortable: true }
  },

  onClick () {
    const { sortDirection, onSortChange } = this.props
    onSortChange(sortDirection > 0 ? -1 : 1)
  },

  getClassName (className, sortDirection) {
    return classnames(className, {
      pointer: true,
      sortable: true,
      'sorted-asc': sortDirection > 0,
      'sorted-desc': sortDirection < 0
    })
  },

  render () {
    // eslint-disable-next-line no-unused-vars
    const { children, sortDirection, style, className, onSortChange, sortable, ...otherProps } = this.props
    const styles = Object.assign({}, style, {whiteSpace: 'nowrap', overflowX: 'hidden'})
    return (
      <th
        className={this.getClassName(className, sortDirection)}
        onClick={this.onClick}
        style={styles}
        {...otherProps}>
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
