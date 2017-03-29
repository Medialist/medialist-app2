import React, { PropTypes } from 'react'
import { LogoFull } from '../images/icons'

const SignInLayout = ({ content }) => {
  return (
    <div className='pt5 mt8 align-middle center' style={{height: window.innerHeight + 'px'}}>
      <LogoFull />
      {content}
      <p className='gray40 semibold f-sm pt4 mb1'>Made in London by <a href='http://medialist.io'>Medialist.io Limited</a></p>
      <p className='gray40 f-sm mt1'>Campaign management and collaboration for PR teams</p>
    </div>
  )
}

SignInLayout.propTypes = {
  onRetry: PropTypes.func
}

export default SignInLayout
