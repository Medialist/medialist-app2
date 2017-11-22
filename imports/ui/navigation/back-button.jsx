import React from 'react'
import { browserHistory } from 'react-router'
import { ChevronLeft } from '/imports/ui/images/icons'

function goBack (e) {
  e.preventDefault()
  browserHistory.go(-1)
}

export default ({onClick = goBack, children = 'Back'}) => (
  <a className='flex-none py4 pl6 gray40 f-sm semibold pointer' onClick={onClick} data-id='back-button'>
    <ChevronLeft />
    <span className='align-middle ml1 bold'>{children}</span>
  </a>
)
