import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { configureUrlQuery } from 'react-url-query'
import Authenticator from '/imports/ui/users/authenticator'
import NavBar from '/imports/ui/navigation/navbar'
import Snackbar from '/imports/ui/snackbar/snackbar'
import Head from '/imports/ui/head'

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
      <Snackbar>
        <Head />
        <Authenticator userId={this.props.userId} user={this.props.user} location={this.props.location}>
          <NavBar user={this.props.user} />
          {this.props.children}
        </Authenticator>
      </Snackbar>
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
    Meteor.subscribe('master-lists'),
    Meteor.subscribe('contactCount'),
    Meteor.subscribe('campaignCount')
  ]
  const loading = !subs.every((sub) => sub.ready())
  return { userId, user, loading }
}, Layout)
