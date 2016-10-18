import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { CircleAvatar } from '../images/avatar'
import FromNow from '../time/from-now'
import YouOrName from '../users/you-or-name'

const ActivityList = React.createClass({
  propTypes: {
    currentUser: PropTypes.object,
    items: PropTypes.array.isRequired
  },

  render () {
    const { items, currentUser } = this.props
    if (!items.length) return <p>No items</p>

    return (
      <ul className='list-reset'>
        {items.map((item) => (
          <li key={item._id}>
            <CircleAvatar avatar={item.createdBy.avatar} name={item.createdBy.name} />
            <ActivityTitle item={item} currentUser={currentUser} />
            <FromNow date={item.createdAt} />
          </li>
        ))}
      </ul>
    )
  }
})

const ActivityTitle = ({ item, currentUser }) => {
  const { type, message, contacts, medialists, status, createdBy } = item

  if (type === 'need to know') {
    return (
      <span>
        <YouOrName currentUser={currentUser} user={createdBy} />
        {'  '} for {contacts[0].name}
      </span>
    )
  }

  if (type === 'details changed' || type === 'medialists changed') {
    return (
      <span>
        <YouOrName currentUser={currentUser} user={createdBy} />
        {'  '} {message}
      </span>
    )
  }

  if (item.type === 'feedback') {
    return (
      <span>
        <YouOrName currentUser={currentUser} user={createdBy} />
        {' '} logged feedback for {contacts[0].name}
        {' '} - <span>{status}</span> for {' '}
        <Link to={`/campaigns/${encodeURIComponent(medialists[0])}`}>
          {medialists[0]}
        </Link>
      </span>
    )
  }
}

export default ActivityList
