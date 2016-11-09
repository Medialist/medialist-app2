import React from 'react'
import { Meteor } from 'meteor/meteor'

const LoginWithTwitter = React.createClass({
  onLoginClick: () => Meteor.loginWithTwitter(),

  render () {
    return (
      <div className='bg-black absolute top-0 left-0 right-0 center pt6' style={{height: window.innerHeight + 'px'}}>
        <button className='mt6' type='button' onClick={this.onLoginClick} title='Click to login via your Twitter account' style={{border: 'solid 0 transparent', backgroundColor: 'transparent'}}>
          <img src='/login.png' width='260px' />
        </button>
      </div>
    )
  }
})

export default LoginWithTwitter
