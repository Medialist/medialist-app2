import React, { PropTypes } from 'react'
import fromNow from '../time/from-now'

export default React.createClass({
  propTypes: {
    notification: PropTypes.object
  },
  render () {
    return (
      <div className="">{this.props.notification.notification}</div>
    )
  }
})
