import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Authenticator from '/imports/ui/users/authenticator'
import NavBar from '/imports/ui/navigation/navbar'
import Snackbar from '/imports/ui/snackbar/snackbar'

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
    Meteor.subscribe('recent-contacts-and-campaigns'),
    Meteor.subscribe('master-lists')
  ]
  const loading = !subs.every((sub) => sub.ready())
  return { userId, user, loading }
}, Layout)
