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
    console.log('scroll', {nearBottom})
    if (this.state.nearBottom === nearBottom) return
    this.setState({nearBottom})
  },
  componentDidMount () {
    this.onScroll = throttle(this.onScroll)
    window.addEventListener('scroll', this.onScroll)

    // Note: When the window is very long, or super zoomed out, the user sees
    // the first 20 results without scrollbars, so there is no way to trigger
    // an limit increase. We force an initial onScroll here to check if we should
    // load more in that case.
    if (window.innerHeight >= 1200) {
      this.onScroll()
    }
  },
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  },
  render () {
    return <div>{this.props.children(this.state.nearBottom)}</div>
  }
})

export default NearBottomContainer
