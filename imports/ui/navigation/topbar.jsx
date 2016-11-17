import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'

const Topbar = React.createClass({
  propTypes: {
    backLinkText: PropTypes.string,
    onBackClick: PropTypes.func
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
    const { backLinkText } = this.props
    return (
      <nav className='block bg-white mb4 flex items-center width-100 shadow-inset'>
        <div className='flex-auto'>
          <span className='pointer inline-block p4' onClick={onBackClick}>{`◀ ${backLinkText}`}</span>
        </div>
      </nav>
    )
  }
})

export default Topbar
