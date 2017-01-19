import React from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'

const LogoutPage = React.createClass({
  componentDidMount () {
    Meteor.logout(() => this.props.router.push('/'))
  },
  render () {
    return null
  }
})

export default withRouter(LogoutPage)
