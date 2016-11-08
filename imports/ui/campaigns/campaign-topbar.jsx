import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'

const CampaignTopbar = React.createClass({
  propTypes: {
    onAddClick: PropTypes.func,
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
    const { backLinkText, onAddClick } = this.props
    return (
      <nav className='block bg-white mb4 flex items-center width-100'>
        <div className='flex-auto'>
          <span className='pointer inline-block p4' onClick={this.onBackClick}>{`◀ ${backLinkText}`}</span>
        </div>
        <div className='flex-none border-left border-gray80 px4 py3'>
          <button type='button' className='btn white bg-blue mx2' onClick={onAddClick}>
            Add Contacts to Campaign
          </button>
        </div>
      </nav>
    )
  }
})

export default CampaignTopbar
