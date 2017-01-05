import React, {PropTypes} from 'react'
import Modal from '../navigation/modal'

const AddCampaignToMasterList = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    currentlyBelongsTo: PropTypes.array
  },
  getInitialState () {
    return {
      currentlySelected: this.props.currentlyBelongsTo || []
    }
  },
  render () {
    if (!this.props.open) return null
    const { currentlySelected } = this.state

    return (
      <div className='p1'>
        {currentlySelected.map((list) => {
          return <button className='m1'>{list.label}</button>
        })}
      </div>
    )
  }
})

export default Modal(AddCampaignToMasterList)
