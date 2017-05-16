import React from 'react'
import classnames from 'classnames'
import { SearchGrayIcon } from '/imports/ui/images/icons'

const SearchSiteBox = (props) => {
  const { className } = props
  return (
    <div className={classnames(className, 'rounded')} style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
      <div className='inline-block' onClick={() => { console.log('TODO: search site') }}>
        <SearchGrayIcon className='mx2 opacity-30' />
      </div>
      <input className='py2 mr2 gray40 opacity-40 bg-transparent border-transparent' placeholder='Search' style={{outline: 'none'}} />
    </div>
  )
}

export default SearchSiteBox
