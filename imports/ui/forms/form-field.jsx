import React from 'react'

const FormField = ({icon, children}) =>
  <div className='relative mb2'>
    <div className='pr2 pt2 gray60 absolute top-0' style={{width: 30, left: -30}}>
      {icon}
    </div>
    {children}
  </div>

export default FormField
