import React from 'react'
import PropTypes from 'prop-types'
import {STATUS_GREEN} from '/imports/ui/colours'

const ProgressBar = ({style, percent = 0, height = 20, overflow = 2}) => {
  return (
    <div className='bg-gray90 align-left mx4' style={{height, borderRadius: height, ...style}}>
      <div
        className='bg-green white semibold px2 f-lg'
        role='progressbar'
        style={{width: `${percent}%`, minWidth: 40, height, borderRadius: height, boxShadow: `${STATUS_GREEN} 0 0 0 ${overflow}px`}}
        aria-valuenow={percent}
        aria-valuemin='0'
        aria-valuemax='100'>
        {percent}%
      </div>
    </div>
  )
}

ProgressBar.propTypes = {
  percent: PropTypes.number
}

export default ProgressBar
