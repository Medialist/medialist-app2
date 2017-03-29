import React from 'react'
import SignInLayout from './sign-in-layout'
import Loading from '../lists/loading'

const SendingEmailPage = () => {
  const content = (
    <div className='bg-white max-width-2 mt6 p5 mx-auto'>
      <p className='semibold f-sm'>Sending email...</p>
      <div className='center p4'><Loading /></div>
      <p className='gray40 f-sm'>Having trouble signing in? Please email us at <a href='mailto:feedback@medialist.io'>feedback@medialist.io</a></p>
    </div>
  )

  return <SignInLayout content={content} />
}

export default SendingEmailPage
