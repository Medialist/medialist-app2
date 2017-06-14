import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { FeedbackInput } from '/imports/ui/feedback/post-box'

class EditPost extends React.Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    post: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  }

  state = {
    value: this.props.post.message || ''
  }

  onChange = (e) => {
    const { value } = e.target
    this.setState({ value })
  }

  render () {
    const { post } = this.props
    const { _id, icon, type, contacts, campaigns } = post
    const contact = contacts[0]
    const contactStatus = {[contact.slug]: post.status}
    const campaign = Object.assign({}, campaigns[0], {contacts: contactStatus})

    return (
      <div>
        <div className='p3 border-gray80 border-bottom'>
          {icon}<span className='mx1'>Edit</span>{type.replace(/Post/g, '')}
        </div>
        <div className='p3'>
          <FeedbackInput {...post} onSubmit={this.props.onUpdate.bind(null, _id)} focused contact={contacts[0]} campaign={campaign} isEdit />
        </div>
      </div>
    )
  }
}

const EditPostWithSnackBar = withSnackbar(EditPost)
export default Modal(EditPostWithSnackBar, { width: 675, overflowY: 'visible' })
