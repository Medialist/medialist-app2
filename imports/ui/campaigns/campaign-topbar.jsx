import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'

const CampaignTopbar = React.createClass({
  propTypes: {
    campaign: PropTypes.object
  },

  onBackClick (e) {
    e.preventDefault()
    browserHistory.go(-1)
  },

  render () {
    const { campaign } = this.props
    if (!campaign) return null

    return (
      <nav className='block bg-white mb4 flex items-center'>
        <div className='flex-auto'>
          <a className='inline-block p4' href='#' onClick={this.onBackClick}>◀ Back</a>
        </div>
        <div className='flex-none border-left border-gray80 px4 py3'>
          <button type='button' className='btn white bg-blue mx2' onClick={() => console.log('TODO: Add to campaign')}>
            Add Contacts to Campaign
          </button>
        </div>
      </nav>
    )
  }
})

export default CampaignTopbar
