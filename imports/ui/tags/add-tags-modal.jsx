import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../navigation/modal'
import { cleanSlug } from '/imports/lib/slug'
import { createContainer } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import Tag from './tag'
import Tags from '/imports/api/tags/tags'
import SearchBox from '../lists/search-box'
import Loading from '../lists/loading'

/*
const TagSelector = React.createClass({
  propTypes: {
    type: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    selectedTags: PropTypes.array,
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
    if (['Enter', 'Tab'].indexOf(e.key) === -1) {
      return
    }

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

    return (
      <div data-id='tag-selector-modal'>
        <SearchBox
          ref={(searchBox) => { this.searchBox = searchBox }}
          style={{borderLeft: '0 none', borderRight: '0 none'}}
          onTermChange={onSearchChange}
          onKeyDown={onKeyDown}
          placeholder='Search or create a new tag'
          data-id='tag-search-input'>
          <div style={{marginBottom: -4}} >
            {selectedTags.map((tag) =>
              <Tag name={tag.name} count={tag[countField]} key={tag.slug} onRemove={() => onRemoveTag(tag)} />
            )}
          </div>
        </SearchBox>
        <div className='pb2' style={{height: 270, overflowY: 'auto'}}>
          {suggestedTags && suggestedTags.map((tag, i) =>
            <TagListItem onClick={() => onSelectTag(tag)} key={tag.slug}>
              #{tag.name}<span className='gray60 ml2 semibold'>{tag[countField]}</span>
            </TagListItem>
          )}
          {searchTerm ? (
            <TagListItem onClick={onCreateTag}>
              Add tag "{searchTerm}"
            </TagListItem>
          ) : (
            <TagListItem>
              Add a tag
            </TagListItem>
          )}
        </div>
      </div>
    )
  }
})

const TagSelectorContainer = createContainer((props) => {
  const userId = Meteor.userId()
  const { searchTerm, type, selectedTags } = props
  const subs = []

  if (searchTerm) {
    subs.push(Meteor.subscribe('tags', {
      type, searchTerm: searchTerm.substring(0, 2)
    }))
  } else {
    subs.push(Meteor.subscribe('tags', {
      type
    }))
  }

  const suggestedTags = Tags
    .suggest({type, userId, searchTerm})
    .fetch()
    .filter((t1) => !selectedTags.some((t2) => t1.slug === t2.slug))

  const loading = subs.some((s) => !s.ready())

  return { ...props, suggestedTags, loading }
}, TagSelector)
*/




const TagListItem = ({onClick, children}) => (
  <div
    style={{paddingLeft: 45}}
    className='py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80'
    onClick={onClick}>
    {children}
  </div>
)

const TagSelector = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['Contacts', 'Campaigns']).isRequired,
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onUpdateTags: PropTypes.func.isRequired,
    suggestedTags: PropTypes.array.isRequired,
    children: PropTypes.node,
    title: PropTypes.string.isRequired,
    loading: PropTypes.bool
  },
  getDefaultProps () {
    return {
      suggestedTags: []
    }
  },
  getInitialState () {
    return {
      searchTerm: '',
      selectedTags: this.props.selectedTags || [],
      searchBoxPlaceholder: 'Search or create a new tag',
      suggestedTags: this.props.suggestedTags || []
    }
  },
  onSave () {
    this.props.onUpdateTags(this.state.selectedTags)
    this.props.onDismiss()
  },
  onCreateTag (event) {
    event.preventDefault()

    this.setState(({selectedTags}) => ({
      searchTerm: '',
      searchBoxPlaceholder: '',
      selectedTags: selectedTags.concat([{
        name: this.state.searchTerm,
        slug: cleanSlug(this.state.searchTerm),
        count: 0
      }])
    }))

    this.searchBox.clear()
  },
  onSelectTag (tag) {
    this.onAddTag(tag)
    this.searchBox.focus()
  },
  onAddTag (tag) {
    this.setState(({selectedTags, suggestedTags}) => ({
      selectedTags: selectedTags.concat([tag]),
      searchBoxPlaceholder: ''
    }))
  },
  onRemoveTag (tag) {
    this.setState(({selectedTags}) => {
      const tags = selectedTags.filter((t) => t.slug !== tag.slug)

      return {
        selectedTags: tags,
        searchBoxPlaceholder: tags.length ? '' : 'Search or create a new tag'
      }
    })
  },
  onKeyDown (event) {
    if (['Enter', 'Tab'].indexOf(event.key) === -1) {
      return
    }

    event.preventDefault()

    if (this.props.suggestedTags.length === 0) {
      this.onCreateTag(event)
    } else {
      this.onSelectTag(this.props.suggestedTags[0])
    }
  },
  render () {
    const countField = `${this.props.type.toLowerCase()}Count`

    return (
      <div>
        <div className='pt6 center f-xl normal'>{this.props.title}</div>
        {this.props.children}
        <div className='pt6 border-bottom border-gray80'>
          <SearchBox
            ref={(searchBox) => {this.searchBox = searchBox}}
            style={{borderLeft: '0 none', borderRight: '0 none'}}
            onTermChange={(searchTerm) => this.setState({searchTerm})}
            onKeyDown={this.onKeyDown}
            placeholder={this.state.searchBoxPlaceholder}
            data-id='tag-search-input'>
            <div style={{marginBottom: -4}} >
              {this.state.selectedTags.map((tag) =>
                <Tag name={tag.name} count={tag[countField]} key={tag.slug} onRemove={() => this.onRemoveTag(tag)} />
              )}
            </div>
          </SearchBox>
          <div className='pb2' style={{height: 270, overflowY: 'auto'}}>
            {this.props.loading && <div className='center p4'><Loading /></div>}

            {this.props.suggestedTags.map((tag, i) =>
              <TagListItem onClick={() => this.onSelectTag(tag)} key={tag.slug}>
                #{tag.name}<span className='gray60 ml2 semibold'>{tag.count}</span>
              </TagListItem>
            )}

            {this.state.searchTerm && this.props.suggestedTags.length === 0 ? (
              <TagListItem onClick={this.onCreateTag}>
                Add tag "{this.state.searchTerm}"
              </TagListItem>
            ) : null}
          </div>
        </div>
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right' onClick={this.onSave} data-id='tag-selector-modal-save-button'>Save Changes</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={this.onDismiss} data-id='tag-selector-modal-save-button'>Cancel</button>
          </div>
        </div>
      </div>
    )
  }
})

const TagSelectorContainer = createContainer((props) => {
  const userId = Meteor.userId()
  const { searchTerm, type, selectedTags } = props
  const subs = []

  if (searchTerm) {
    subs.push(Meteor.subscribe('tags', {
      type: type,
      searchTerm: searchTerm.substring(0, 2)
    }))
  } else {
    subs.push(Meteor.subscribe('tags', {
      type: type
    }))
  }

  const suggestedTags = Tags
    .suggest({type, userId, searchTerm})
    .fetch()
    .filter((t1) => !(selectedTags || []).some((t2) => t1.slug === t2.slug))

  const loading = subs.some((s) => !s.ready())

  return { suggestedTags, loading, ...props }
}, TagSelector)

export default Modal(TagSelectorContainer, {
  width: 495,
  'data-id': 'tag-selector-modal'
})
