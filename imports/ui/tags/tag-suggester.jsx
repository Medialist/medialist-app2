import React from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import Tags from '/imports/api/tags/tags'
import Loading from '/imports/ui/lists/loading'
import Scroll from '/imports/ui/navigation/scroll'

const TagListItem = (props) => (
  <div
    style={{paddingLeft: 45}}
    className='py2 border-transparent border-top border-bottom hover-bg-gray90 hover-border-gray80'
    onClick={props.onClick}
    data-id={props['data-id']}>
    {props.children}
  </div>
)

const TagSuggester = ({loading, suggestedTags, searchTerm, onSelectTag, onCreateTag}) => {
  return (
    <Scroll height={'calc(95vh - 380px)'} className='pb2'>
      {loading && <div className='center p4'><Loading /></div>}

      {!loading && suggestedTags.map((tag, i) =>
        <TagListItem onClick={() => onSelectTag(tag)} key={tag.slug} data-id={tag.slug}>
          #{tag.name}<span className='gray60 ml2 semibold'>{tag.count}</span>
        </TagListItem>
      )}

      {!loading && (searchTerm && suggestedTags.length === 0 ? (
        <TagListItem onClick={() => onCreateTag(searchTerm)} data-id='create-new-tag'>
          Add tag "{searchTerm}"
        </TagListItem>
      ) : null)}
    </Scroll>
  )
}

export default createContainer((props) => {
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
}, TagSuggester)
