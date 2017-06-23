import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import { removePost } from '/imports/api/posts/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import DeleteConfirmation from '/imports/ui/navigation/delete-confirmation'
import dasherise from 'dasherize'

const DeletePost = withSnackbar(React.createClass({
  propTypes: {
    post: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  onDelete () {
    removePost.call({
      _ids: [this.props.post._id]
    }, (error) => {
      if (error) {
        console.error('Failed to delete post', error)
        this.props.snackbar.error('delete-post-failure')
      } else {
        this.props.snackbar.show(`Deleted post`, 'delete-post-success')
      }

      this.props.onDelete()
    })
  },

  render () {
    const type = dasherise(this.props.post.type.replace(/Post/g, ' ')).replace(/-/g, ' ').trim()

    return (
      <DeleteConfirmation type='Post' items={[this.props.post]} onDelete={() => this.onDelete()} onDismiss={this.props.onDismiss}>
        <h3 className='normal f-xl m4'>Are you sure you want to <strong>delete this {type}</strong>?</h3>
        <h4 className='normal f-xl'>Deleted posts can't be retrieved.</h4>
      </DeleteConfirmation>
    )
  }
}))

export default Modal(DeletePost, {
  width: 500,
  'data-id': 'delete-post-modal'
})
