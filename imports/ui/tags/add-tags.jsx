import React, {PropTypes} from 'react'
import Modal from '../navigation/modal'
import TagSelector from './tag-selector'
import { cleanSlug } from '/imports/lib/slug'

const AddTags = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['Contacts', 'Campaigns']).isRequired,
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    selectedTags: PropTypes.array.isRequired,
    onUpdateTags: PropTypes.func.isRequired,
    children: PropTypes.node
  },
  getInitialState () {
    return {
      searchTerm: '',
      selectedTags: this.props.selectedTags || []
    }
  },
  onSave () {
    this.props.onUpdateTags(this.state.selectedTags)
    this.props.onDismiss()
  },
  onCreateTag (searchTerm) {
    const {type} = this.props
    this.setState(({selectedTags}) => ({
      searchTerm: '',
      selectedTags: selectedTags.concat([{
        name: searchTerm,
        slug: cleanSlug(searchTerm),
        [`${type.toLowerCase()}Count`]: 0
      }])
    }))
  },
  onAddTag (tag) {
    this.setState(({selectedTags}) => ({
      selectedTags: selectedTags.concat([tag])
    }))
  },
  onRemoveTag (tag) {
    this.setState(({selectedTags}) => ({
      selectedTags: selectedTags.filter((t) => t.slug !== tag.slug)
    }))
  },
  render () {
    if (!this.props.open) return null
    const { selectedTags, searchTerm } = this.state
    const { onSave, onCreateTag, onAddTag, onRemoveTag } = this
    const { type, onDismiss, title, children } = this.props
    return (
      <div>
        <div className='pt6 center f-xl normal'>
          {title}
        </div>
        {children}
        <div className='pt6 border-bottom border-gray80'>
          <TagSelector
            type={type}
            onSearchChange={(searchTerm) => this.setState({searchTerm})}
            searchTerm={searchTerm}
            selectedTags={selectedTags}
            onCreateTag={onCreateTag}
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

export default Modal(AddTags, {width: 495})
