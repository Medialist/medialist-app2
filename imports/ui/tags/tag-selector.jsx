import React, {PropTypes} from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import Tag from './tag'
import Tags from '/imports/api/tags/tags'

const TagSelector = React.createClass({
  propTypes: {
    onSearchChange: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    selectedTags: PropTypes.array.isRequired,
    suggestedTags: PropTypes.array.isRequired,
    onCreateTag: PropTypes.func.isRequired,
    onAddTag: PropTypes.func.isRequired,
    onRemoveTag: PropTypes.func.isRequired
  },
  onChange (e) {
    const { value } = e.target
    this.props.onSearchChange(value)
  },
  onSelectTag (tag) {
    this.props.onAddTag(tag)
    this.refs['tag-input'].focus()
  },
  onCreateTag () {
    const { onCreateTag, searchTerm } = this.props
    onCreateTag(searchTerm)
  },
  onKeyUp (e) {
    if (['Enter', 'Tag'].indexOf(e.key) === -1) return
    const {suggestedTags} = this.props
    if (suggestedTags.length === 0) {
      this.onCreateTag()
    } else {
      this.onSelectTag(suggestedTags[0])
    }
  },
  render () {
    const { onChange, onSelectTag, onCreateTag, onKeyUp } = this
    const { selectedTags, suggestedTags, searchTerm, onRemoveTag } = this.props
    return (
      <div>
        <div className='border-top border-gray80 py1 px4'>
          {selectedTags.map((tag) => <Tag {...tag} key={tag.slug} onRemove={onRemoveTag} />)}
          <input
            ref='tag-input'
            className='py2 mr2 gray20 f-md bg-transparent border-transparent'
            style={{outline: 'none'}}
            onChange={onChange}
            onKeyUp={onKeyUp}
            value={searchTerm} />
        </div>
        <div className='border-top border-gray80 pb2 overflow-hidden overflow-scroll-y' style={{height: 270}}>
          {suggestedTags && suggestedTags.map((tag, i) =>
            <SelectableTag tag={tag} onSelectTag={onSelectTag} key={tag.slug} />
          )}
          <div className='px4 py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80' onClick={onCreateTag}>
            <span>{searchTerm && searchTerm.length > 0 ? `Add tag "${searchTerm}"` : `Add a tag`}</span>
          </div>
        </div>
      </div>
    )
  }
})

const SelectableTag = (props) => {
  const { tag, onSelectTag } = props
  return (
    <div className='px4 py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80' onClick={() => onSelectTag(tag)}>
      #{tag.name}<span className='gray60 ml2 semibold'>{tag.count}</span>
    </div>
  )
}

const TagSelectorContainer = createContainer((props) => {
  const userId = Meteor.userId()
  const { searchTerm, type, selectedTags } = props
  const subs = []
  console.log({type})
  if (searchTerm) {
    subs.push(Meteor.subscribe('tags', {type, searchTerm: searchTerm.substring(0, 2)}))
  } else {
    subs.push(Meteor.subscribe('tags', {type}))
  }
  const suggestedTags = Tags
    .suggest({type, userId, searchTerm})
    .fetch()
    .filter((t1) => !selectedTags.some((t2) => t1.slug === t2.slug))

  const loading = subs.some((s) => !s.ready())

  return { ...props, suggestedTags, loading }
}, TagSelector)

export default TagSelectorContainer

window.Tags = Tags
