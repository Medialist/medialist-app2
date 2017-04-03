import React, { PropTypes } from 'react'
import SignInLayout from './sign-in-layout'

const EmailSentPage = ({ onRetry }) => {
  const content = (
    <div className='bg-white max-width-2 mt6 p5 mx-auto shadow-2'>
      <p className='semibold f-sm'>We have sent you a link to sign into Medialist. Please check your inbox</p>
      <button className='btn bg-blue white mt3 mb3' data-id='back-to-login-form-button' onClick={onRetry}>Okay</button>
      <p className='gray40 f-sm'>Having trouble signing in? Please email us at <a href='mailto:feedback@medialist.io'>feedback@medialist.io</a></p>
    </div>
  )

  return <SignInLayout content={content} />
}

EmailSentPage.propTypes = {
  onRetry: PropTypes.func
}

export default EmailSentPage
