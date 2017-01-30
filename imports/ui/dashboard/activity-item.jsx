import React from 'react'
import { CircleAvatar } from '../images/avatar'
import Time from '../time/time'
import ActivityIcon from './activity-item-icon'
import ActivityItemTitle from './activity-item-title'
import ActivityItemContent from './activity-item-content'

export default ({ item, currentUser }) => (
  <article className='flex rounded bg-white px4 py2 mb2 shadow-2'>
    <div className='flex-none'>
      <CircleAvatar avatar={item.createdBy.avatar} name={item.createdBy.name} style={{marginRight: 13}} />
      <ActivityIcon type={item.type} />
    </div>
    <div className='flex-auto'>
      <header className='pt2 pb3 f-md'>
        <span className='f-sm semibold gray60 right'>
          <Time date={item.createdAt} />
        </span>
        <ActivityItemTitle item={item} currentUser={currentUser} />
      </header>
      <ActivityItemContent item={item} currentUser={currentUser} />
    </div>
  </article>
)
