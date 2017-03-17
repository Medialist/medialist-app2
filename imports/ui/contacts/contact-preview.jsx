import React from 'react'
import { CircleAvatar } from '../images/avatar'

const ContactPreview = ({name, avatar, outlets, ...props}) => (
  <div className='flex items-start' {...props}>
    <CircleAvatar className='flex-none' size={38} avatar={avatar} name={name} />
    <div className='flex-auto pl3' style={{lineHeight: 1.3}}>
      <div className='f-md semibold gray10 truncate' title={name}>
        {name}
      </div>
      <div className='f-sm normal gray20 truncate'>{(outlets && outlets.length) ? outlets[0].value : null}</div>
      <div className='f-sm normal gray40 truncate'>{outlets.map((o) => o.label).join(', ')}</div>
    </div>
  </div>
)

export default ContactPreview
