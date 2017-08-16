import React from 'react'
import SignInLayout from '/imports/ui/sign-in/sign-in-layout'
import { LoadingBar } from '/imports/ui/lists/loading'

const SendingEmailPage = () => {
  const content = (
    <div className='bg-white max-width-2 mt6 p5 mx-auto shadow-2'>
      <p className='semibold f-sm'>Sending email...</p>
      <LoadingBar />
      <p className='gray40 f-sm'>Having trouble signing in? Please email us at <a href='mailto:feedback@medialist.io'>feedback@medialist.io</a></p>
    </div>
  )

  return <SignInLayout content={content} />
}

export default SendingEmailPage
