import React, {PropTypes} from 'react'
import Modal from '../navigation/modal'
import TagSelector from './tag-selector'

const AddTags = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    selectedTags: PropTypes.array.isRequired,
    allTags: PropTypes.array.isRequired,
    onUpdateTags: PropTypes.func.isRequired
  },
  getInitialState () {
    return { tags: this.props.selectedTags }
  },
  updatedSelectedTags (tags) {
    this.setState({ tags })
  },
  onSave () {
    this.props.onUpdateTags(this.state.tags)
    this.props.onDismiss()
  },
  render () {
    if (!this.props.open) return null
    const { tags } = this.state
    const { updatedSelectedTags, onSave } = this
    const { onDismiss, title, allTags } = this.props
    return (
      <div>
        <div className='py6 center f-lg normal'>
          {title}
        </div>
        <div className='border-bottom border-gray80'>
          <TagSelector selectedTags={tags} allTags={allTags} parentState={updatedSelectedTags} />
        </div>
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right' onClick={onSave}>Save Changes</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={onDismiss}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }
})

export default Modal(AddTags)
