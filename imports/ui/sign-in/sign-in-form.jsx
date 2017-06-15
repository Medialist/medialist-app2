import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { Form, Input, Button } from '@achingbrain/react-validation'
import SignInLayout from '/imports/ui/sign-in/sign-in-layout'

const SignInForm = React.createClass({
  getInitialState () {
    return {
      email: this.props.email || ''
    }
  },
  onSubmit (e) {
    e.preventDefault()

    const errors = this.form.validateAll()

    if (Object.keys(errors).length) {
      return
    }

    const email = this.state.email.trim()

    this.props.onSubmit(email)
  },
  onFieldChange (event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  },
  render () {
    const form = (
      <Form className='bg-white max-width-2 mt6 p5 mx-auto shadow-2' onSubmit={this.onSubmit} ref={(form) => { this.form = form }}>
        <p className='semibold f-sm'>Enter your email address to sign in or create a profile on {window.location.hostname}</p>
        <div className='mb6 left-align'>
          <label className='block gray40 semibold f-sm pt4 mb2' htmlFor='email'>Email</label>
          <Input
            className='input placeholder-gray60'
            errorClassName='error'
            name='email'
            value={this.props.email}
            placeholder={`yourname@${Meteor.settings.public.authentication.emailDomains[0]}`}
            onChange={this.onFieldChange}
            data-id='authenticate-email-field'
            validations={['required', 'signInEmail']}
          />
        </div>
        <div>
          <Button className='btn bg-blue white width-100' data-id='authenticate-send-email-button' disabled={false}>Email me a link to sign in</Button>
        </div>
      </Form>
    )

    return <SignInLayout content={form} />
  }
})

SignInForm.propTypes = {
  onSubmit: PropTypes.func,
  email: PropTypes.string
}

export default SignInForm
