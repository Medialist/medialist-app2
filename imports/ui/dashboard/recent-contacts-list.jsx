import React from 'react'
import { Link } from 'react-router'
import { MenuContactIcon } from '../images/icons'

export default () => (<section className='block'>
  <header className='clearfix p4 border-gray80 border-bottom'>
    <Link to='/contacts' className='f-sm semibold blue right' >See All</Link>
    <h1 className='m0 f-md semibold gray20 left'>
      <MenuContactIcon className='gray60' />
      <span className='ml1'>My Recent Contacts</span>
    </h1>
  </header>
</section>)
