import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Authenticator from './users/authenticator'
import NavBar from './navigation/navbar'
import Snackbar from './snackbar/snackbar'

const Layout = React.createClass({
  propTypes: {
    user: PropTypes.object
  },

  render () {
    const { children, userId, user } = this.props
    return (
      <Authenticator userId={userId} user={user}>
        <Snackbar>
          <div>
            <NavBar user={user} />
            {children}
          </div>
        </Snackbar>
      </Authenticator>
    )
  }
})

export default createContainer(() => {
  const user = Meteor.user()
  const userId = Meteor.userId()
  let subs = [
    Meteor.subscribe('my-contacts-and-campaigns'),
    Meteor.subscribe('master-lists')
  ]
  const loading = !subs.every((sub) => sub.ready())
  return { userId, user, loading }
}, Layout)
