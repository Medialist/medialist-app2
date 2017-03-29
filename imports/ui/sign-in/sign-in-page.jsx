import React from 'react'
import { Meteor } from 'meteor/meteor'
import { browserHistory } from 'react-router'
import SignInForm from './sign-in-form'
import EmailSentPage from './email-sent-page'
import SendingEmailPage from './sending-email-page'
import SignInErrorPage from './sign-in-error-page'

const SignInPage = React.createClass({
  getInitialState () {
    return {
      status: 'START',
      email: null
    }
  },
  onRetry () {
    this.setState(this.getInitialState())
  },
  onSubmit (email) {
    this.setState({
      status: 'SENDING_EMAIL'
    })

    Meteor.call('Authentication/sendLogInLink', { email }, (error, result) => {
      if (error) {
        if (error.error === 'INVALID_EMAIL') {
          this.setState({
            status: 'INVALID_EMAIL',
            email: email
          })
        } else {
          this.setState({
            status: 'ERROR_SENDING_EMAIL'
          })
        }

        return
      }

      if (result && result.token) {
        // we got a login token, must be our lucky day
        Meteor.loginWithToken(result.token, (error) => {
          if (error) {
            this.state.message = <p className='semibold f-sm'>An unknown error occured</p>

            return
          }

          browserHistory.push('/')
        })

        return
      }

      this.setState({
        status: 'EMAIL_SENT'
      })
    })
  },
  render () {
    if (this.state.status === 'SENDING_EMAIL') {
      return <SendingEmailPage />
    } else if (this.state.status === 'ERROR_SENDING_EMAIL') {
      return <SignInErrorPage onRetry={this.onRetry} />
    } else if (this.state.status === 'EMAIL_SENT') {
      return <EmailSentPage onRetry={this.onRetry} />
    } else if (this.state.status === 'INVALID_EMAIL') {
      return <SignInForm onSubmit={this.onSubmit} email={this.state.email} />
    }

    return <SignInForm onSubmit={this.onSubmit} />
  }
})

export default SignInPage
