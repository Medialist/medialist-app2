import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { CircleAvatar } from '../images/avatar'
import FromNow from '../time/from-now'
import YouOrName from '../users/you-or-name'
import Status from '../feedback/status'

const ActivityList = React.createClass({
  propTypes: {
    currentUser: PropTypes.object,
    items: PropTypes.array.isRequired
  },

  render () {
    const { items, currentUser } = this.props
    if (!items.length) return <p className='p4 mb2 f-xl semibold center'>No items yet</p>

    return (
      <ul className='list-reset'>
        {items.map((item) => (
          <li key={item._id} className='bg-white px4 py2 mb2 shadow-2'>
            <article className='flex'>
              <div className='flex-none pr4'>
                <CircleAvatar avatar={item.createdBy.avatar} name={item.createdBy.name} />
              </div>
              <div className='flex-auto'>
                <header className='py3 f-md'>
                  <span className='f-sm semibold gray60 right'>
                    <FromNow date={item.createdAt} />
                  </span>
                  <ActivityTitle item={item} currentUser={currentUser} />
                </header>
                {item.message && (
                  <div className='border-gray80 border-top py3 f-md normal'>{item.message}</div>
                )}
              </div>
            </article>
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
        <span className='gray10'> logged feedback </span>
        <span className='f-xxxs gray60 mx1'> ▶ </span>
        <Link className='semibold gray10' to={`/campaigns/${encodeURIComponent(medialists[0])}`}>{medialists[0]}</Link>
        <span className='f-xxxs gray60 mx1'> ▶ </span>
        <span className='semibold gray10'>{contacts[0].name}</span>
        <Status status={status} />
      </span>
    )
  }
}

export default ActivityList
