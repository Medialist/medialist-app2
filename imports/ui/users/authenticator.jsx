import React from 'react'
import PropTypes from 'prop-types'
import { browserHistory } from 'react-router'
import SignInPage from '/imports/ui/sign-in/sign-in-page'
import OnboardingPage from '/imports/ui/users/onboarding-page'
import Loading from '/imports/ui/lists/loading'

const Authenticator = ({ userId, user, children, location }) => {
  if (userId && !user) {
    // the user object arrives after page load
    return <div className='center p4'><Loading /></div>
  }

  if (!user) {
    return <SignInPage />
  }

  if (!user.profile || !user.profile.name) {
    return <OnboardingPage location={location} />
  }

  if (location.query.r) {
    browserHistory.push(location.query.r)

    return null
  }

  return <div>{children || null}</div>
}

Authenticator.propTypes = {
  user: PropTypes.object,
  userId: PropTypes.string,
  location: PropTypes.object
}

export default Authenticator
