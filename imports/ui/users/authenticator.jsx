import React, { PropTypes } from 'react'
import LoginWithTwitter from './login-with-twitter'

const Authenticator = ({ children, user }) => (
  user ? <div>{children || null}</div> : <LoginWithTwitter />
)

Authenticator.propTypes = { user: PropTypes.object }

export default Authenticator
