import React from 'react'
import { Link } from 'react-router'

export default () => (<section className='block'>
  <header className='clearfix p3 border-gray80 border-bottom'>
    <Link to='/contacts' className='f-sm semibold blue right' >See all</Link>
    <h1 className='m0 f-md semibold gray20 left'>My Recent Contacts</h1>
  </header>
</section>)
