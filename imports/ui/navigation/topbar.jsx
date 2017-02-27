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
      <nav className='block bg-white mb4 flex items-center shadow-inset-2' style={{height: 58, overflow: 'hidden'}}>
        <div className='flex-auto'>
          <BackButton>{backLinkText}</BackButton>
        </div>
        <div className='flex-none border-left border-gray80 px4 py3'>
          {children}
        </div>
      </nav>
    )
  }
})

export default Topbar
