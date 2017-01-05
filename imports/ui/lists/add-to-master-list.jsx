import React from 'react'
import Modal from '../navigation/modal'

const AddCampaignToMasterList = React.createClass({
  render () {
    if (!this.props.open) return null
    return (
      <div className='p2'>Hello you <span onClick={() => this.props.onDismiss()}>X</span></div>
    )
  }
})

export default Modal(AddCampaignToMasterList)
