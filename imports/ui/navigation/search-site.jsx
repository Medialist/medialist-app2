import React from 'react'
import classnames from 'classnames'
import { SearchGrayIcon } from '../images/icons'

const SearchSiteBox = (props) => {
  const { className } = props
  return (
    <div className={classnames(className, 'rounded')} style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
      <div onClick={() => { console.log('TODO: search site') }}><SearchGrayIcon className='ml2 mr1' /></div>
      <input className='py2 mr2 gray40 bg-transparent border-transparent placeholder-gray40' placeholder='Search' style={{outline: 'none'}} />
    </div>
  )
}

export default SearchSiteBox
