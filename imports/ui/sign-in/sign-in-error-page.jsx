import React from 'react'
import PropTypes from 'prop-types'
import SignInLayout from '/imports/ui/sign-in/sign-in-layout'

const SignInErrorPage = ({ onRetry }) => {
  const content = (
    <div className='bg-white max-width-2 mt6 p5 mx-auto'>
      <p className='semibold f-sm gray10'>An unknown error occured, please try again later</p>
      <button className='btn bg-blue white my3' data-id='back-to-login-form-button' onClick={onRetry}>Okay</button>
      <p className='gray40 f-sm'>Having trouble signing in? Please email us at <a href='mailto:feedback@medialist.io'>feedback@medialist.io</a></p>
    </div>
  )

  return <SignInLayout content={content} />
}

SignInErrorPage.propTypes = {
  onRetry: PropTypes.func
}

export default SignInErrorPage
