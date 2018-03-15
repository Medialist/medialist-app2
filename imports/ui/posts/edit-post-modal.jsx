import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import { updatePost } from '/imports/api/posts/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { NeedToKnowInput } from '/imports/ui/feedback/post-box'
import FeedbackInput from '/imports/ui/feedback/input-feedback'
import CoverageInput from '/imports/ui/feedback/input-coverage'

class EditPost extends React.Component {
  static propTypes = {
    contact: PropTypes.object,
    campaign: PropTypes.object,
    open: PropTypes.bool.isRequired,
    post: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired
  }

  state = {
    value: this.props.post.message || ''
  }

  onChange = (e) => {
    const { value } = e.target
    this.setState({ value })
  }

  onUpdatePost = (details) => {
    const { post } = this.props

    const update = {
      _id: post._id,
      ...details
    }

    updatePost.call(update, (err) => {
      if (err) {
        this.props.snackbar.error('update-post-failure')
        return console.error(err)
      }
      this.props.onDismiss()
    })
  }

  render () {
    const { post } = this.props
    const { icon, type, contacts, campaigns } = post

    const Component = {
      'FeedbackPost': FeedbackInput,
      'CoveragePost': CoverageInput,
      'NeedToKnowPost': NeedToKnowInput
    }[type]

    return (
      <div data-id='edit-post-modal'>
        <div className='p3 border-gray80 border-bottom'>
          {icon}<span className='mx1'>Edit</span>{type.replace(/Post/g, '')}
        </div>
        <div className='p3'>
          <Component
            {...post}
            contact={contacts && contacts[0]}
            campaign={campaigns && campaigns[0]}
            onSubmit={this.onUpdatePost}
            focused
            isEdit />
        </div>
      </div>
    )
  }
}

const EditPostWithSnackBar = withSnackbar(EditPost)

export default Modal(EditPostWithSnackBar, { width: 675, overflowY: 'visible' })
