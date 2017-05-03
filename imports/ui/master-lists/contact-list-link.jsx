import React from 'react'
import { Link } from 'react-router'

export default ({contactList, linkClassName = 'semibold gray10'}) => (
  <Link className={linkClassName} to={`/contacts?list=${contactList.slug}`} data-id='contact-list-link'>
    <span data-id='contact-list-name'>{contactList.name}</span>
  </Link>
)
