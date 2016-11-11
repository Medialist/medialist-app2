import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'

const Topbar = React.createClass({
  propTypes: {
    backLinkText: PropTypes.string,
    onBackClick: PropTypes.func,
    children: PropTypes.node
  },

  getDefaultProps () {
    return { backLinkText: 'Back' }
  },

  onBackClick () {
    if (this.props.onBackClick) return this.props.onBackClick()
    browserHistory.go(-1)
  },

  render () {
    const { onBackClick } = this
    const { backLinkText, children } = this.props
    return (
      <nav className='block bg-white mb4 flex items-center width-100'>
        <span className='flex-auto pointer inline-block p4' onClick={onBackClick}>{`◀ ${backLinkText}`}</span>
        <span className='flex-none inline-block'>{children}</span>
      </nav>
    )
  }
})

export default Topbar
