import React from 'react'
import PropTypes from 'prop-types'
import throttle from '/imports/lib/raf-throttle'

const Scroll = React.createClass({
  propTypes: {
    test: PropTypes.func,
    height: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onScrollChange: PropTypes.func.isRequired
  },
  getDefaultProps () {
    return {
      onScrollChange: () => {}
    }
  },
  lastScrollTop: false,
  onScroll () {
    const { lastScrollTop } = this
    const { scrollTop } = this.containerEl
    if (scrollTop === lastScrollTop) return
    this.props.onScrollChange({lastScrollTop, scrollTop})
    this.lastScrollTop = scrollTop
  },
  render () {
    const {height, className} = this.props
    return (
      <div
        ref={(el) => { this.containerEl = el }}
        style={{height, overflowY: 'auto'}}
        className={className}
        onScroll={throttle(this.onScroll)}>
        { this.props.children }
      </div>
    )
  }
})

export default Scroll
