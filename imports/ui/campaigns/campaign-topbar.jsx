import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'

const CampaignTopbar = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    backLinkText: PropTypes.string,
    onBackClick: PropTypes.func
  },

  onBackClick (e) {
    if (this.props.onBackClick) return this.props.onBackClick()
    e.preventDefault()
    browserHistory.go(-1)
  },

  render () {
    const { campaign, backLinkText } = this.props
    if (!campaign) return null
    return (
      <nav className='block bg-white mb4 flex items-center'>
        <div className='flex-auto'>
          <span className='pointer inline-block p4' onClick={this.onBackClick}>{`◀ ${backLinkText || 'Back'}`}</span>
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
