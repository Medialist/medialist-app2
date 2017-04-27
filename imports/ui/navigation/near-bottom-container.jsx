import React from 'react'
import PropTypes from 'prop-types'
import throttle from '/imports/lib/raf-throttle'

const NearBottomContainer = React.createClass({
  propTypes: {
    children: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      nearBottom: false
    }
  },
  isNearBottom () {
    return document.body.getBoundingClientRect().bottom - window.innerHeight < 100
  },
  onScroll () {
    const nearBottom = this.isNearBottom()
    if (this.state.nearBottom === nearBottom) return
    this.setState({nearBottom})
  },
  componentDidMount () {
    this.onScroll = throttle(this.onScroll)
    window.addEventListener('scroll', this.onScroll)
    this.onScroll()
  },
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  },
  render () {
    return <div>{this.props.children(this.state.nearBottom)}</div>
  }
})

export default NearBottomContainer
