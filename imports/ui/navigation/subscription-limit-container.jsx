import React from 'react'
import PropTypes from 'prop-types'

class SubscriptionLimitContainer extends React.PureComponent {
  static propTypes = {
    wantMore: PropTypes.bool.isRequired,
    initialLimit: PropTypes.number.isRequired,
    incrementBy: PropTypes.number.isRequired,
    resetLimit: PropTypes.bool,
    children: PropTypes.func.isRequired
  }

  static defaultProps = {
    initialLimit: 20,
    incrementBy: 20
  }

  state = {
    limit: this.props.initialLimit
  }

  componentWillReceiveProps (nextProps) {
    console.log('sub limit componentWillReceiveProps', {wantMore: nextProps.wantMore, limit: this.state.limit})
    if (!nextProps.wantMore && !nextProps.resetLimit) {
      return
    }

    this.setState((s) => {
      const limit = nextProps.resetLimit ? this.props.initialLimit : s.limit + this.props.incrementBy
      console.log('subs limit set state', limit, this.props, nextProps)
      return { limit }
    })
  }

  render () {
    return <div>{this.props.children(this.state.limit)}</div>
  }
}

export default SubscriptionLimitContainer
