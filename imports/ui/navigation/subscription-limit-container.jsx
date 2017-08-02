import React from 'react'
import PropTypes from 'prop-types'

const SubscriptionLimitContainer = React.createClass({
  propTypes: {
    wantMore: PropTypes.bool.isRequired,
    initialLimit: PropTypes.number.isRequired,
    incrementBy: PropTypes.number.isRequired,
    children: PropTypes.func.isRequired
  },
  getDefaultProps () {
    return {
      initialLimit: 20,
      incrementBy: 20
    }
  },
  getInitialState () {
    return {
      limit: this.props.initialLimit
    }
  },
  componentWillReceiveProps (nextProps) {
    if (!nextProps.wantMore) {
      return
    }

    this.setState((s) => ({limit: s.limit + this.props.incrementBy}))
  },
  render () {
    return <div>{this.props.children(this.state.limit)}</div>
  }
})

export default SubscriptionLimitContainer
