import React, { PropTypes } from 'react'
import ActivityItem from './activity-item'

const ActivityList = React.createClass({
  propTypes: {
    currentUser: PropTypes.object,
    items: PropTypes.array.isRequired
  },

  render () {
    const { items, currentUser } = this.props
    if (!items.length) return <p className='p4 mb2 f-xl semibold center'>No items yet</p>
    return (
      <div>
        {items.map((item) => (
          <ActivityItem key={item._id} item={item} currentUser={currentUser} />
        ))}
      </div>
    )
  }
})

export default ActivityList
