import { Meteor } from 'meteor/meteor'
import React from 'react'
import PropTypes from 'prop-types'
import { createContainer } from 'meteor/react-meteor-data'
import Modal from '/imports/ui/navigation/modal'
import { cleanSlug } from '/imports/lib/slug'
import Tag from '/imports/ui/tags/tag'
import SearchBox from '/imports/ui/lists/search-box'
import TagSuggester from '/imports/ui/tags/tag-suggester'
import Tags from '/imports/api/tags/tags'

class TagSelector extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    selectedTags: PropTypes.array.isRequired,
    suggestedTags: PropTypes.array.isRequired,
    searchTerm: PropTypes.string.isRequired,
    onTermChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCreateTag: PropTypes.func.isRequired,
    onAddTag: PropTypes.func.isRequired,
    onRemoveTag: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['Contacts', 'Campaigns']).isRequired,
    children: PropTypes.node
  }

  static defaultProps = {
    title: 'Tags'
  }

  // TODO: if you type fast, this can occur before the state.searchTerm is updated, so we can end up submitting an empty value
  onKeyDown = (event) => {
    if (['Enter', 'Tab'].indexOf(event.key) === -1) {
      return
    }
    event.preventDefault()
    const {suggestedTags, searchTerm} = this.props
    if (suggestedTags.length) {
      this.onAddTag(suggestedTags[0])
    } else {
      this.onCreateTag(searchTerm)
    }
  }

  onAddTag = (tag) => {
    this.props.onAddTag(tag)
    this.searchBox.value = ''
    this.searchBox.focus()
  }

  onCreateTag = (term) => {
    this.props.onCreateTag(term)
    this.searchBox.value = ''
    this.searchBox.focus()
  }

  onRemoveTag = (tag) => {
    this.props.onRemoveTag(tag)
    this.searchBox.value = ''
    this.searchBox.focus()
  }

  render () {
    const { type, title, children } = this.props
    console.log({children})
    const countField = `${type.toLowerCase()}Count`
    return (
      <div>
        <div className='py6 center'>
          <span className='f-xl'>{title}</span>
          {children}
        </div>
        <SearchBox
          inputRef={(searchBox) => { this.searchBox = searchBox }}
          style={{borderLeft: '0 none', borderRight: '0 none'}}
          initialTerm={this.props.searchTerm}
          onTermChange={this.props.onTermChange}
          onKeyDown={this.onKeyDown}
          placeholder={this.props.selectedTags.length ? '' : 'Search or create a new tag'}
          data-id='tag-search-input'>
          <div style={{marginBottom: -4}} >
            {this.props.selectedTags.map((tag) =>
              <Tag name={tag.name} count={tag[countField] || tag.count} key={tag.slug} onRemove={() => this.onRemoveTag(tag)} />
            )}
          </div>
        </SearchBox>
        <TagSuggester
          loading={this.props.loading}
          suggestedTags={this.props.suggestedTags}
          searchTerm={this.props.searchTerm}
          onCreateTag={this.onCreateTag}
          onSelectTag={this.onAddTag} />
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right' onClick={this.props.onSave} data-id='tag-selector-modal-save-button'>Save</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={this.props.onDismiss} data-id='tag-selector-modal-cancel-button'>Cancel</button>
          </div>
        </div>
      </div>
    )
  }
}

const TagSelectorModal = Modal(TagSelector, {
  width: 495,
  'data-id': 'tag-selector-modal'
})

const TagSelectorDataContainer = createContainer((props) => {
  const userId = Meteor.userId()
  const { searchTerm, type, selectedTags } = props

  const subs = []
  const opts = {type}
  if (searchTerm) {
    opts.searchTerm = searchTerm.substring(0, 2)
  }
  subs.push(Meteor.subscribe('tags', opts))

  const suggestedTags = Tags
    .suggest({type, userId, searchTerm})
    .fetch()
    .filter((t1) => !selectedTags.some((t2) => t1.slug === t2.slug))

  const loading = subs.some((s) => !s.ready())

  return { suggestedTags, loading }
}, TagSelectorModal)

export default class TagSelectorContainer extends React.Component {
  static propTypes = {
    selectedTags: PropTypes.array.isRequired,
    onUpdateTags: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    children: PropTypes.node,
    title: PropTypes.string,
    open: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['Contacts', 'Campaigns']).isRequired
  }

  static defaultProps = {
    selectedTags: []
  }

  state = {
    searchTerm: '',
    selectedTags: this.props.selectedTags
  }

  onTermChange = (searchTerm) => {
    this.setState({searchTerm})
  }

  onSave = () => {
    const {onUpdateTags, onDismiss} = this.props
    onUpdateTags(this.state.selectedTags)
    onDismiss()
  }

  onCreateTag = (tag) => {
    this.setState(({selectedTags}) => ({
      searchTerm: '',
      selectedTags: selectedTags.concat([{
        name: tag,
        slug: cleanSlug(tag),
        count: 0
      }])
    }))
  }

  onAddTag = (tag) => {
    this.setState(({selectedTags}) => ({
      searchTerm: '',
      selectedTags: selectedTags.concat([tag])
    }))
  }

  onRemoveTag = (tag) => {
    this.setState(({selectedTags}) => {
      const tags = selectedTags.filter((t) => t.slug !== tag.slug)
      return {
        selectedTags: tags
      }
    })
  }

  render () {
    if (!this.props.open) return null
    return (
      <TagSelectorDataContainer
        title={this.props.title}
        open={this.props.open}
        type={this.props.type}
        searchTerm={this.state.searchTerm}
        selectedTags={this.state.selectedTags}
        onTermChange={this.onTermChange}
        onSave={this.onSave}
        onCreateTag={this.onCreateTag}
        onAddTag={this.onAddTag}
        onRemoveTag={this.onRemoveTag}
        onDismiss={this.props.onDismiss}
        children={this.props.children} />
    )
  }
}

