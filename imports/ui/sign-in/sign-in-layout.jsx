import React from 'react'
import PropTypes from 'prop-types'
import { LogoFull } from '/imports/ui/images/icons'
import version from '/imports/ui/version.json'

const SignInLayout = ({ content }) => {
  return (
    <div className='pt5 mt8 align-middle center' style={{height: window.innerHeight + 'px'}}>
      <LogoFull />
      {content}
      <p className='gray40 semibold f-sm pt4 mb1'>Made in London by <a href='http://medialist.io'>Medialist.io Limited</a></p>
      <p className='gray40 f-sm mt1 mb1'>Campaign management and collaboration for PR teams</p>
      <p className='gray90 f-sm mt1'>Build {version.commit}</p>
    </div>
  )
}

SignInLayout.propTypes = {
  onRetry: PropTypes.func
}

export default SignInLayout
