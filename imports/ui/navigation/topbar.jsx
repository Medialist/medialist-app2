import React from 'react'
import PropTypes from 'prop-types'
import BackButton from '/imports/ui/navigation/back-button'

class Topbar extends React.Component {
  static propTypes = {
    backLinkText: PropTypes.string,
    children: PropTypes.node
  }

  static defaultProps = {
    backLinkText: 'Back'
  }

  render () {
    const { backLinkText, children, center } = this.props
    return (
      <nav className='block bg-white mb4 flex items-center width-100 border-gray80 border-bottom' style={{height: 58, overflow: 'hidden'}}>
        <div className='flex-none'>
          <BackButton>{backLinkText}</BackButton>
        </div>
        <div className='flex-auto'>
          {center}
        </div>
        <div className='flex-none'>
          {children}
        </div>
      </nav>
    )
  }
}

export default Topbar
