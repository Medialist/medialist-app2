import React from 'react'
import { CircleAvatar } from '../images/avatar'

const ContactPreview = ({contact, ...props}) => (
  <div className='flex items-start' {...props}>
    <CircleAvatar className='flex-none' size={38} avatar={contact.avatar} name={contact.name} />
    <div className='flex-auto pl3' style={{lineHeight: 1.3}}>
      <div className='f-md semibold gray10 truncate' title={contact.name}>
        {contact.name}
      </div>
      <div className='f-sm normal gray20 truncate'>{(contact.outlets && contact.outlets.length) ? contact.outlets[0].value : null}</div>
      <div className='f-sm normal gray40 truncate'>{contact.outlets.map((o) => o.label).join(', ')}</div>
    </div>
  </div>
)

export default ContactPreview
