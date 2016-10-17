import React from 'react'
import { Meteor } from 'meteor/meteor'

const LoginWithTwitter = React.createClass({
  onLoginClick: () => Meteor.loginWithTwitter(),

  render () {
    return <button type='button' onClick={this.onLoginClick} title='Click to login via your Twitter account'>Login</button>
  }
})

export default LoginWithTwitter
