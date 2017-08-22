import React from 'react'
import PropTypes from 'prop-types'
import SignInLayout from '/imports/ui/sign-in/sign-in-layout'
import { Meteor } from 'meteor/meteor'
import { browserHistory } from 'react-router'
import InvalidTokenPage from '/imports/ui/sign-in/invalid-token-page'
import { LoadingBar } from '/imports/ui/lists/loading'
import SignInErrorPage from '/imports/ui/sign-in/sign-in-error-page'

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

        browserHistory.push('/' + (this.props.location.search || ''))
      })
    })
  },
  onRetry () {
    this.props.location.reload()
  },
  render () {
    if (this.state.errorLoggingIn) {
      return <SignInErrorPage onRetry={this.onRetry} />
    }

    if (this.state.invalidToken) {
      return <InvalidTokenPage onRetry={this.onRetry} />
    }

    const content = (
      <div className='bg-white max-width-2 mt6 p5 mx-auto shadow-2'>
        <p className='semibold f-sm'>Signing you in...</p>
        <LoadingBar />
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
