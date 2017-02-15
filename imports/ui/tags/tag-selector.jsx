import React, {PropTypes} from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import Tag from './tag'
import Tags from '/imports/api/tags/tags'
import SearchBox from '../lists/search-box'

const TagSelector = React.createClass({
  propTypes: {
    type: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    selectedTags: PropTypes.array.isRequired,
    suggestedTags: PropTypes.array.isRequired,
    onCreateTag: PropTypes.func.isRequired,
    onAddTag: PropTypes.func.isRequired,
    onRemoveTag: PropTypes.func.isRequired
  },
  onSelectTag (tag) {
    this.props.onAddTag(tag)
    this.searchBox.focus()
  },
  onCreateTag () {
    const { onCreateTag, searchTerm } = this.props
    onCreateTag(searchTerm)
    this.searchBox.clear()
  },
  onKeyDown (e) {
    if (['Enter', 'Tab'].indexOf(e.key) === -1) return
    e.preventDefault()
    const {suggestedTags} = this.props
    if (suggestedTags.length === 0) {
      this.onCreateTag()
    } else {
      this.onSelectTag(suggestedTags[0])
    }
  },
  render () {
    const { onSelectTag, onCreateTag, onKeyDown } = this
    const { type, selectedTags, suggestedTags, searchTerm, onRemoveTag, onSearchChange } = this.props
    const countField = `${type.toLowerCase()}Count`
    return (
      <div>
        <SearchBox
          ref={(searchBox) => { this.searchBox = searchBox }}
          style={{borderLeft: '0 none', borderRight: '0 none'}}
          onTermChange={onSearchChange}
          onKeyDown={onKeyDown}>
          <div style={{marginBottom: -4}} >
            {selectedTags.map((tag) =>
              <Tag name={tag.name} count={tag[countField]} key={tag.slug} onRemove={() => onRemoveTag(tag)} />
            )}
          </div>
        </SearchBox>
        <div className='pb2' style={{height: 270, overflowY: 'auto'}}>
          {suggestedTags && suggestedTags.map((tag, i) =>
            <ListItem onClick={() => onSelectTag(tag)} key={tag.slug}>
              #{tag.name}<span className='gray60 ml2 semibold'>{tag[countField]}</span>
            </ListItem>
          )}
          {searchTerm ? (
            <ListItem onClick={onCreateTag}>
              Add tag "{searchTerm}"
            </ListItem>
          ) : (
            <ListItem>
              Add a tag
            </ListItem>
          )}
        </div>
      </div>
    )
  }
})

const ListItem = ({onClick, children}) => (
  <div
    style={{paddingLeft: 45}}
    className='py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80'
    onClick={onClick}>
    {children}
  </div>
)

const TagSelectorContainer = createContainer((props) => {
  const userId = Meteor.userId()
  const { searchTerm, type, selectedTags } = props
  const subs = []
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
