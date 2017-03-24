import React, { PropTypes } from 'react'
import SignInPage from '../sign-in/sign-in-page'

const Authenticator = ({ user, children }) => {
  if (user) {
    return <div>{children || null}</div>
  }

  return <SignInPage />
}

Authenticator.propTypes = {
  user: PropTypes.object
}

export default Authenticator
