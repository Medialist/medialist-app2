import React from 'react'
import { browserHistory } from 'react-router'
import { Meteor } from 'meteor/meteor'
import ValidationBanner from '../errors/validation-banner'

const LogoutPage = React.createClass({
  getInitialState () {
    return {err: null}
  },
  componentDidMount () {
    Meteor.logout((err) => {
      if (err) return this.setState({ err })
      browserHistory.push('/')
    })
  },
  render () {
    const { err } = this.state
    return err ? <ValidationBanner error={err.reason || 'error logging out'} /> : null
  }
})

export default LogoutPage
