import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import PostBoxTextArea from '/imports/ui/feedback/post-box-textarea'
import { PostBoxButtons } from '/imports/ui/feedback/post-box'

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

  onUpdate = (update) => {
    console.log('create edit methods', update)
  }

  render () {
    const { value } = this.state
    const { post } = this.props
    const { icon, type } = post
    console.log(post)
    return (
      <div>
        <div className='p3 border-gray80 border-bottom'>
          {icon}<span className='mx1'>Edit</span>{type.replace(/Post/g, '')}
        </div>
        <div className='p3'>
          <PostBoxTextArea
            placeholder={`edit ${type}`}
            value={value}
            focused
            disabled={false}
            onChange={this.onChange}
          />
        </div>
        <div className='p3'>
          <PostBoxButtons
            focused={false}
          />
        </div>
      </div>
    )
  }
}

const EditPostWithSnackBar = withSnackbar(EditPost)
export default Modal(EditPostWithSnackBar, { width: 675 })
