import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Authenticator from './users/authenticator'

const Layout = React.createClass({
  propTypes: {
    user: PropTypes.object
  },

  render () {
    const { children, user } = this.props
    return <Authenticator user={user}>{children}</Authenticator>
  }
})

export default createContainer(() => ({ user: Meteor.user() }), Layout)
