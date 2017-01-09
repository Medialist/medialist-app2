import React, {PropTypes} from 'react'
import Tag from './tag'
import find from 'lodash.find'
import capitalize from 'underscore.string/capitalize'

const TagSelector = React.createClass({
  propTypes: {
    selectedTags: PropTypes.array.isRequired,
    allTags: PropTypes.array.isRequired,
    onAddTag: PropTypes.func.isRequired,
    onRemoveTag: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      value: '',
      filteredTags: this.createFilteredTags(this.props)
    }
  },
  componentWillReceiveProps (props) {
    this.setState({ filteredTags: this.createFilteredTags(props) })
  },
  createFilteredTags (props) {
    const { allTags, selectedTags } = props
    return allTags.filter((tag) => !find(selectedTags, {slug: tag.slug}))
  },
  onChange (e) {
    const { value } = e.target
    if (!value) return this.setState({ value })

    const filteredTags = this.props.allTags
      .filter((tag) => !find(this.props.selectedTags, {slug: tag.slug}))
      .filter((tag) => tag.name.toLowerCase().substring(0, value.length) === value.toLowerCase())

    this.setState({ value, filteredTags })
  },
  onAddTag (tag) {
    this.props.onAddTag(tag)
    this.setState({ value: '' })
    this.refs['tag-input'].focus()
  },
  onRemoveTag (tag) {
    this.props.onRemoveTag(tag)
  },
  createTag () {
    const newTag = {
      name: capitalize(this.state.value),
      slug: this.state.value.toLowerCase().replace(' ', '-'),
      count: 0
    }
    this.onAddTag(newTag)
    console.log('TODO: Add ', newTag.name, ' to DB')
  },
  onKeyUp (e) {
    if (e.key === 'Enter' || e.key === 'Tab') this.createTag()
  },
  render () {
    const { onChange, onAddTag, onRemoveTag, createTag, onKeyUp } = this
    const { selectedTags } = this.props
    const { value, filteredTags } = this.state
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
            value={value} />
        </div>
        <div className='border-top border-gray80 pb2 overflow-hidden overflow-scroll' style={{height: 270}}>
          {filteredTags.length > 0 ? (
            filteredTags.map((tag, i) => <SelectableTag tag={tag} onAddTag={onAddTag} key={tag.slug} />)
          ) : (
            <div className='px4 py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80' onClick={createTag}>
              <span>{value.length > 0 ? `Add tag "${value}"` : `Add a tag`}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
})

const SelectableTag = (props) => {
  const { tag, onAddTag } = props
  return (
    <div className='px4 py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80' onClick={() => onAddTag(tag)}>
      #{tag.name}<span className='gray60 ml2 semibold'>{tag.count}</span>
    </div>
  )
}

export default TagSelector
