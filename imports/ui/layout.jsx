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
    const { children, user } = this.props
    return (
      <Authenticator user={user}>
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
  let subs = [
    Meteor.subscribe('my-contacts-and-campaigns'),
    Meteor.subscribe('master-lists')
  ]
  const loading = !subs.every((sub) => sub.ready())
  return { user, loading }
}, Layout)
