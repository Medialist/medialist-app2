import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

const LoginOrRegister = React.createClass({
  getInitialState () {
    return {
      email: '',
      password: '',
      name: ''
    }
  },
  signIn (e) {
    e.preventDefault()

    const email = this.state.email.trim()
    const password = this.state.password.trim()

    Meteor.loginWithPassword(email, password)
  },
  register (e) {
    e.preventDefault()

    const email = this.state.email.trim()
    const password = this.state.password.trim()
    const name = this.state.name.trim()

    Accounts.createUser({
      email: email,
      password: password,
      profile: {
        name: name
      }
    })
  },
  handleChange (e) {
    this.setState({[e.target.name]: e.target.value})
  },
  render () {
    return (
      <div className='bg-black absolute top-0 left-0 right-0 center pt6' style={{height: window.innerHeight + 'px'}}>
        <h1>Sign in or Register</h1>
        <form>
          <div className='form-group'>
            <label htmlFor='email'>Email:</label>
            <input placeholder='Email' type='email' name='email' id='authenticate-email-field' onChange={this.handleChange} />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password:</label>
            <input placeholder='Password' type='password' name='password' id='authenticate-password-field' onChange={this.handleChange} />
          </div>
          <div className='form-group'>
            <label htmlFor='name'>Name:</label>
            <input placeholder='Name' type='text' name='name' id='authenticate-name-field' onChange={this.handleChange} />
          </div>
          <div className='form-group'>
            <button type='submit' id='authenticate-sign-in-button' onClick={this.signIn}>Sign in</button>
            <button type='submit' id='authenticate-register-button' onClick={this.register}>Register</button>
          </div>
        </form>
      </div>
    )
  }
})

export default LoginOrRegister
