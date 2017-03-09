import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import LoginWithTwitter from './login-with-twitter'
import LoginWithPassword from './login-with-password'

const Authenticator = ({ children, user }) => {
  if (user) {
    return <div>{children || null}</div>
  }

  if (Meteor.settings.public.authentication === 'password') {
    return <LoginWithPassword />
  }

  return <LoginWithTwitter />
}

Authenticator.propTypes = { user: PropTypes.object }

export default Authenticator
