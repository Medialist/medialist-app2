import React from 'react'
import Progress from 'rebass/dist/Progress'

export default ({ value }) => (
  <div className='px2 py1'>
    <p className='f-xs normal gray20'>Uploading image...</p>
    <Progress color='primary' value={value} />
  </div>
)
