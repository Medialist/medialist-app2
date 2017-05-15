import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Authenticator from './users/authenticator'
import NavBar from './navigation/navbar'
import Snackbar from './snackbar/snackbar'

class Layout extends React.Component {
  render () {
    return (
      <Authenticator userId={this.props.userId} user={this.props.user} location={this.props.location}>
        <Snackbar>
          <div>
            <NavBar user={this.props.user} />
            {this.props.children}
          </div>
        </Snackbar>
      </Authenticator>
    )
  }
}

Layout.propTypes = {
  user: PropTypes.object
}

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
