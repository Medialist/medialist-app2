import React from 'react'
import PropTypes from 'prop-types'

class DeleteConfirmation extends React.Component {
  onDelete (event) {
    event.preventDefault()

    this.props.onDelete()
  }

  onDismiss (event) {
    event.preventDefault()

    this.props.onDismiss()
  }

  render () {
    const name = `${this.props.type}${this.props.items.length > 1 ? 's' : ''}`

    return (
      <div className='relative'>
        <div className='center px4 pt4 pb6'>
          {this.props.children}
        </div>

        <div className='flex items-center p4 bg-white border-top border-gray80'>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' onClick={(event) => this.props.onDismiss(event)} data-id='cancel-button'>No, Keep {name}</button>
            <button className='btn bg-not-interested white' onClick={(event) => this.onDelete(event)} data-id='confirm-button'>Yes, Delete {name}</button>
          </div>
        </div>
      </div>
    )
  }
}

DeleteConfirmation.propTypes = {
  items: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired
}

export default DeleteConfirmation
