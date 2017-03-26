import React, { PropTypes } from 'react'
import SignInPage from '../sign-in/sign-in-page'
import OnboardingPage from './onboarding-page'

const Authenticator = ({ user, children }) => {
  if (!user) {
    return <SignInPage />
  }

  if (!user.profile || !user.profile.name) {
    return <OnboardingPage />
  }

  return <div>{children || null}</div>
}

Authenticator.propTypes = {
  user: PropTypes.object
}

export default Authenticator
