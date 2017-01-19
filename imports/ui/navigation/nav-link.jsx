import React from 'react'
import { Link } from 'react-router'

export default function (props) {
  return <Link {...props} className='inline-block pointer p4 semibold f-sm gray40' activeClassName='shadow-inset-blue blue' />
}
