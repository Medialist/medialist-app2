import React from 'react'
import { CircleAvatar } from '../images/avatar'
import FromNow from '../time/from-now'
import ActivityItemTitle from './activity-item-title'
import ActivityItemContent from './activity-item-content'

export default ({ item, currentUser }) => (
  <li className='bg-white px4 py2 mb2 shadow-2'>
    <article className='flex'>
      <div className='flex-none pr4'>
        <CircleAvatar avatar={item.createdBy.avatar} name={item.createdBy.name} />
      </div>
      <div className='flex-auto'>
        <header className='pt2 pb3 f-md'>
          <span className='f-sm semibold gray60 right'>
            <FromNow date={item.createdAt} />
          </span>
          <ActivityItemTitle item={item} currentUser={currentUser} />
        </header>
        <ActivityItemContent item={item} currentUser={currentUser} />
      </div>
    </article>
  </li>
)
