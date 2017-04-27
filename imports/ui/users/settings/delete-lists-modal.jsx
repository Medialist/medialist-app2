import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import DeleteConfirmation from '/imports/ui/navigation/delete-confirmation'

const DeleteLists = withSnackbar(React.createClass({
  propTypes: {
    lists: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  onDelete () {
    Meteor.call('MasterLists/delete', {
      _ids: this.props.lists.map(list => list._id)
    }, (error) => {
      if (error) {
        console.error(error)
        this.props.snackbar.error(`delete-${this.props.type}-lists-failure`)
      } else {
        const name = this.props.lists.length > 1 ? `${this.props.lists.length} Lists` : this.props.lists[0].name

        this.props.snackbar.show(`Deleted ${name}`, `delete-${this.props.type}-lists-success`)
      }

      this.props.onDelete()
    })
  },

  render () {
    const listType = `${this.props.type.substring(0, 1).toUpperCase()}${this.props.type.substring(1)}`
    const name = this.props.lists.length > 1 ? `these ${listType} Lists` : `the ${listType} List "${this.props.lists[0].name}"`

    return (
      <DeleteConfirmation type='List' items={this.props.lists} onDelete={() => this.onDelete()} onDismiss={this.props.onDismiss}>
        <h3 className='normal f-xl m4'>Are you sure you want to <strong>delete {name}</strong>?</h3>
        <h4 className='normal f-xl'>Deleted lists can't be retrieved.</h4>
      </DeleteConfirmation>
    )
  }
}))

export default Modal(DeleteLists, {
  width: 500,
  'data-id': 'delete-lists-modal'
})
