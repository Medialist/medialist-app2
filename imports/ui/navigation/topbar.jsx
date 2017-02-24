import React, { PropTypes } from 'react'
import BackButton from '../navigation/back-button'

const Topbar = React.createClass({
  propTypes: {
    backLinkText: PropTypes.string,
    children: PropTypes.node
  },

  getDefaultProps () {
    return { backLinkText: 'Back' }
  },

  render () {
    const { backLinkText, children } = this.props
    return (
      <nav className='block bg-white mb4 flex items-center width-100'>
        <BackButton>{backLinkText}</BackButton>
        <span className='flex-none inline-block'>{children}</span>
      </nav>
    )
  }
})

export default Topbar
