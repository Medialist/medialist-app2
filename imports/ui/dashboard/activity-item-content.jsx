import React from 'react'
import { SquareAvatar } from '../images/avatar'
import { Link } from 'react-router'

export default ({ item }) => {
  const { type, details } = item

  if (type === 'campaign created') {
    const { slug, name, avatar, clientName } = details.campaign

    return (
      <div className='border-gray80 border-top py3'>
        <Link key={slug} to={`/campaign/${slug}`} className='block py1' title={name}>
          <SquareAvatar size={38} avatar={avatar} name={name} />
          <div className='inline-block align-middle'>
            <div className='ml3 semibold f-md gray10'>{name}</div>
            <div className='ml3 regular f-sm gray20' style={{marginTop: 2}}>
              {clientName}
            </div>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className='border-gray80 border-top py3 f-md normal gray10'>{item.message}</div>
  )
}
