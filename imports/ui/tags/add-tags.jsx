import React, {PropTypes} from 'react'
import Modal from '../navigation/modal'
import TagSelector from './tag-selector'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'

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
    return { selectedTags: this.props.selectedTags }
  },
  onSave () {
    this.props.onUpdateTags(this.state.selectedTags)
    this.props.onDismiss()
  },
  onAddTag (tag) {
    const selectedTags = this.state.selectedTags.slice(0)
    if (find(selectedTags, {slug: tag.slug})) return
    selectedTags.push(tag)
    this.setState({ selectedTags })
  },
  onRemoveTag (tag) {
    const selectedTags = this.state.selectedTags.slice(0)
    const index = findIndex(selectedTags, {slug: tag.slug})
    selectedTags.splice(index, 1)
    this.setState({ selectedTags })
  },
  render () {
    if (!this.props.open) return null
    const { selectedTags } = this.state
    const { onSave, onAddTag, onRemoveTag } = this
    const { onDismiss, title, allTags } = this.props
    return (
      <div>
        <div className='py6 center f-lg normal'>
          {title}
        </div>
        <div className='border-bottom border-gray80'>
          <TagSelector
            selectedTags={selectedTags}
            allTags={allTags}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag} />
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
