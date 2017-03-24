import React, { PropTypes } from 'react'
import SignInLayout from './sign-in-layout'
import { Meteor } from 'meteor/meteor'
import { browserHistory } from 'react-router'
import InvalidTokenPage from '../sign-in/invalid-token-page'
import Loading from '../lists/loading'
import SignInErrorPage from './sign-in-error-page'

const SigningInPage = React.createClass({
  getInitialState () {
    return {
      invalidToken: false,
      errorLoggingIn: false
    }
  },
  componentDidMount () {
    Meteor.call('Authentication/verifyLoginToken', {
      token: this.props.params.token
    }, (error, result) => {
      if (error) {
        return this.setState({
          invalidToken: true
        })
      }

      Meteor.loginWithToken(result.token, (error) => {
        if (error) {
          return this.setState({
            errorLoggingIn: true
          })
        }

        browserHistory.push('/')
      })
    })
  },
  onRetry () {
    browserHistory.push('/')
  },
  render () {
    if (this.state.errorLoggingIn) {
      return <SignInErrorPage onRetry={this.onRetry} />
    }

    if (this.state.invalidToken) {
      return <InvalidTokenPage onRetry={this.onRetry} />
    }

    const content = (
      <div className='bg-white max-width-2 mt6 p5 mx-auto'>
        <p className='semibold f-sm'>Signing you in...</p>
        <div className='center p4'><Loading /></div>
        <p className='gray40 f-sm'>Having trouble signing in? Please email us at <a href='mailto:feedback@medialist.io'>feedback@medialist.io</a></p>
      </div>
    )

    return <SignInLayout content={content} />
  }
})

SigningInPage.propTypes = {
  params: PropTypes.object
}

export default SigningInPage
