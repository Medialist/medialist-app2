import React, { PropTypes } from 'react'
import { SquareAvatar } from '../images/avatar'

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    onEditClick: PropTypes.func
  },

  getInitialState () {
    return { showMore: false }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  render () {
    if (!this.props.campaign) return null
    const { name, avatar } = this.props.campaign
    const { showMore } = this.state

    return (
      <div>
        <div className='mb1'>
          <SquareAvatar className='ml2' size={70} avatar={avatar} name={name} />
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl mb1'>{name}</span>
          </div>
        </div>
        <div className='clearfix p3 pt4 mt4 border-gray80 border-bottom'>
          <a href='#' className='f-xs blue right' onClick={this.props.onEditClick}>Edit campaign</a>
          <h1 className='m0 f-md normal gray20 left'>Info</h1>
        </div>
        <a href='#' className='f-sm blue my3' onClick={this.onShowMoreToggleClick}>Show {showMore ? 'Less' : 'More'}</a>
      </div>
    )
  }
})

export default CampaignInfo
