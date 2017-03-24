import React, { PropTypes } from 'react'
import SignInLayout from './sign-in-layout'

const SignInForm = React.createClass({
  getInitialState () {
    console.info('getting state', this.props.email)
    return {
      email: this.props.email || '',
      message: this.props.email ? <p className='semibold f-sm'>You must use an @{window.location.hostname} email address</p> : <p className='semibold f-sm'>Enter your email address to sign in or create a profile on {window.location.hostname}</p>
    }
  },
  onSubmit (e) {
    e.preventDefault()

    const email = this.state.email.trim()

    if (!email) {
      this.setState({
        message: <p className='semibold f-sm'>You must use an @{window.location.hostname} email address</p>
      })

      return
    }

    console.info('submitting', email)
    this.props.onSubmit(email)
  },
  onChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  },
  render () {
    const form = (
      <form className='bg-white max-width-2 mt6 p5 mx-auto' onSubmit={this.onSubmit}>
        <div className='mb6 left-align'>
          {this.state.message}
          <label className='block gray40 semibold f-sm pt4 mb2' htmlFor='email'>Email address</label>
          <input className='input' placeholder={`yourname@${window.location.hostname}`} type='email' name='email' id='authenticate-email-field' onChange={this.onChange} value={this.state.email} />
        </div>
        <div>
          <button className='btn bg-blue white width-100' type='submit' id='authenticate-send-email-button'>Email me a link to sign in</button>
        </div>
      </form>
    )

    return <SignInLayout content={form} />
  }
})

SignInForm.propTypes = {
  onSubmit: PropTypes.func,
  email: PropTypes.string
}

export default SignInForm
