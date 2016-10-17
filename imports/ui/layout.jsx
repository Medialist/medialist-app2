import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Authenticator from './users/authenticator'
import NavBar from './navigation/navbar'

const Layout = React.createClass({
  propTypes: {
    user: PropTypes.object
  },

  render () {
    const { children, user, notifications } = this.props
    return (
      <Authenticator user={user}>
        <div>
          <NavBar user={user} notifications={notifications} />
          {children}
        </div>
      </Authenticator>
    )
  }
})

export default createContainer(() => ({
  user: Meteor.user(),
  notifications: []
}), Layout)
