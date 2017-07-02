import React from 'react'
import PropTypes from 'prop-types'
import Modal from '/imports/ui/navigation/modal'
import { cleanSlug } from '/imports/lib/slug'
import Tag from '/imports/ui/tags/tag'
import SearchBox from '/imports/ui/lists/search-box'
import TagSuggester from '/imports/ui/tags/tag-suggester'

const TagSelector = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['Contacts', 'Campaigns']).isRequired,
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
  onCreateTag (tag) {
    this.setState(({selectedTags}) => ({
      selectedTags: selectedTags.concat([{
        name: tag,
        slug: cleanSlug(tag),
        count: 0
      }]),
      searchTerm: ''
    }))

    this.searchBox.clear()
  },
  onAddTag (tag) {
    this.setState(({selectedTags}) => ({
      selectedTags: selectedTags.concat([tag]),
      searchBoxPlaceholder: '',
      searchTerm: ''
    }))
  },
  onSelectTag (tag) {
    this.onAddTag(tag)
    this.searchBox.focus()
  },
  onRemoveTag (tag) {
    this.setState(({selectedTags}) => {
      const tags = selectedTags.filter((t) => t.slug !== tag.slug)

      return {
        selectedTags: tags
      }
    })
  },
  onKeyDown (event) {
    if (['Enter', 'Tab'].indexOf(event.key) === -1) {
      return
    }

    event.preventDefault()

    this.onCreateTag(this.state.searchTerm)
  },
  render () {
    const countField = `${this.props.type.toLowerCase()}Count`

    return (
      <div>
        <div className='pt6 center f-xl normal'>Tags</div>
        {this.props.children}
        <div className='pt6 border-bottom border-gray80'>
          <SearchBox
            ref={(searchBox) => { this.searchBox = searchBox }}
            style={{borderLeft: '0 none', borderRight: '0 none'}}
            onTermChange={(searchTerm) => this.setState({searchTerm})}
            onKeyDown={this.onKeyDown}
            placeholder={this.state.selectedTags.length ? '' : 'Search or create a new tag'}
            data-id='tag-search-input'>
            <div style={{marginBottom: -4}} >
              {this.state.selectedTags.map((tag) =>
                <Tag name={tag.name} count={tag[countField] || tag.count} key={tag.slug} onRemove={() => this.onRemoveTag(tag)} />
              )}
            </div>
          </SearchBox>
          <TagSuggester
            type={this.props.type}
            searchTerm={this.state.searchTerm}
            selectedTags={this.state.selectedTags}
            onSelectTag={this.onSelectTag}
            onCreateTag={this.onCreateTag} />
        </div>
        <div className='p4 bg-white'>
          <div className='clearfix'>
            <button className='btn bg-completed white right' onClick={this.onSave} data-id='tag-selector-modal-save-button'>Save</button>
            <button className='btn bg-transparent gray40 right mr2' onClick={this.props.onDismiss} data-id='tag-selector-modal-cancel-button'>Cancel</button>
          </div>
        </div>
      </div>
    )
  }
})

export default Modal(TagSelector, {
  width: 495,
  'data-id': 'tag-selector-modal'
})
