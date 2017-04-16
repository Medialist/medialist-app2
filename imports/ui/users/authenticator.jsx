import React, { PropTypes } from 'react'
import SignInPage from '../sign-in/sign-in-page'
import OnboardingPage from './onboarding-page'
import Loading from '../lists/loading'

const Authenticator = ({ userId, user, children }) => {
  if (userId && !user) {
    // the user object arrives after page load
    return <div className='center p4'><Loading /></div>
  }

  if (!user) {
    return <SignInPage />
  }

  if (!user.profile || !user.profile.name) {
    return <OnboardingPage />
  }

  return <div>{children || null}</div>
}

Authenticator.propTypes = {
  user: PropTypes.object,
  userId: PropTypes.string
}

export default Authenticator
