import React, {PropTypes} from 'react'
import Tag from './tag'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import capitalize from 'underscore.string/capitalize'

const TagSelector = React.createClass({
  propTypes: {
    selectedTags: PropTypes.array.isRequired,
    allTags: PropTypes.array.isRequired,
    parentState: PropTypes.func
  },
  getInitialState () {
    const { allTags, selectedTags } = this.props
    const filteredTags = allTags.filter((tag) => !find(selectedTags, {slug: tag.slug}))
    return { value: '', selectedTags, filteredTags }
  },
  updateTagLists (selectedTags) {
    this.setState({
      selectedTags,
      filteredTags: this.props.allTags.filter((tag) => !find(selectedTags, {slug: tag.slug}))
    })
    if (this.props.parentState) this.props.parentState(selectedTags)
  },
  onChange (e) {
    const { value } = e.target
    const filteredTags = this.props.allTags.filter((tag) => {
      return tag.name.toLowerCase().substring(0, value.length) === value.toLowerCase()
    })
    this.setState({ value, filteredTags })
  },
  onSelect (tag) {
    const selectedTags = this.state.selectedTags.slice(0)
    if (find(selectedTags, {slug: tag.slug})) return
    selectedTags.push(tag)
    this.updateTagLists(selectedTags)
    this.refs['tag-input'].focus()
  },
  onRemoveTag (tag) {
    const selectedTags = this.state.selectedTags.slice(0)
    const index = findIndex(selectedTags, {slug: tag.slug})
    selectedTags.splice(index, 1)
    this.updateTagLists(selectedTags)
  },
  createTag () {
    const newTag = {
      name: capitalize(this.state.value),
      slug: this.state.value.toLowerCase().replace(' ', '-'),
      count: 0
    }
    this.setState({ value: '' })
    this.onSelect(newTag)
    console.log('TODO: Add a new tag to the DB')
  },
  onKeyUp (e) {
    if (e.key === 'Enter' || e.key === 'Tab') this.createTag()
  },
  render () {
    const { onChange, onSelect, onRemoveTag, createTag, onKeyUp } = this
    const { value, selectedTags, filteredTags } = this.state
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
            filteredTags.map((tag, i) => <SelectableTag tag={tag} onSelect={onSelect} key={tag.slug} />)
          ) : (
            <div className='px4 py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80' onClick={createTag}>
              <span>Add tag "{value}"</span>
            </div>
          )}
        </div>
      </div>
    )
  }
})

const SelectableTag = (props) => {
  const { tag, onSelect } = props
  return (
    <div className='px4 py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80' onClick={() => onSelect(tag)}>
      #{tag.name}<span className='gray60 ml2 semibold'>{tag.count}</span>
    </div>
  )
}

export default TagSelector
