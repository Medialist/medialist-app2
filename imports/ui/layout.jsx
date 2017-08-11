import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { configureUrlQuery } from 'react-url-query'
import Authenticator from '/imports/ui/users/authenticator'
import NavBar from '/imports/ui/navigation/navbar'
import Snackbar from '/imports/ui/snackbar/snackbar'

class Layout extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  }

  componentWillMount () {
    const { router } = this.context
    // https://github.com/pbeshai/react-url-query/issues/22#issuecomment-321074926
    configureUrlQuery({
      history: router
    })
  }

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
    Meteor.subscribe('master-lists'),
    Meteor.subscribe('contactCount')
  ]
  const loading = !subs.every((sub) => sub.ready())
  return { userId, user, loading }
}, Layout)
