import React from 'react'
import PropTypes from 'prop-types'
import SignInLayout from '/imports/ui/sign-in/sign-in-layout'

const EmailSentPage = ({ onRetry }) => {
  const content = (
    <div className='bg-white max-width-2 mt6 p5 mx-auto shadow-2'>
      <p className='semibold f-sm gray10'>We have sent you a link to sign into Medialist. Please check your inbox</p>
      <button className='btn bg-blue white my3' data-id='back-to-login-form-button' onClick={onRetry}>Okay</button>
      <p className='gray40 f-sm'>Having trouble signing in? Please email us at <a href='mailto:feedback@medialist.io'>feedback@medialist.io</a></p>
    </div>
  )

  return <SignInLayout content={content} />
}

EmailSentPage.propTypes = {
  onRetry: PropTypes.func
}

export default EmailSentPage
