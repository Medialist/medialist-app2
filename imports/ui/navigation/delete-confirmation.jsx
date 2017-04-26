import React, { PropTypes } from 'react'

const DeleteConfirmation = React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  onDelete (event) {
    event.preventDefault()

    this.props.onDelete()
  },

  render () {
    const name = `${this.props.type}${this.props.items.length > 1 ? 's' : ''}`

    return (
      <div className='relative'>
        <div className='center px4 pt4 pb6'>
          {this.props.children}
        </div>

        <div className='flex items-center p4 bg-white border-top border-gray80'>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={this.props.onDismiss} data-id='cancel-delete-button'>No, Keep {name}</button>
            <button className='btn bg-not-interested white' onClick={this.onDelete} data-id='confirm-delete-button'>Yes, Delete {name}</button>
          </div>
        </div>
      </div>
    )
  }
})

export default DeleteConfirmation
