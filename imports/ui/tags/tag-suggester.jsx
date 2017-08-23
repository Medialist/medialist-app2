import React from 'react'
import { LoadingBar } from '/imports/ui/lists/loading'
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

export default ({loading, suggestedTags, searchTerm, onSelectTag, onCreateTag}) => {
  return (
    <Scroll height={'calc(95vh - 380px)'} className='pb2'>
      {loading && <LoadingBar />}

      {!loading && suggestedTags.map((tag, i) =>
        <TagListItem onClick={() => onSelectTag(tag)} key={tag.slug} data-id={tag.slug}>
          #{tag.name}<span className='gray60 ml2 semibold'>{tag.count}</span>
        </TagListItem>
      )}

      {!loading && searchTerm ? (
        <TagListItem onClick={() => onCreateTag(searchTerm)} data-id='create-new-tag'>
          Add tag "{searchTerm}"
        </TagListItem>
      ) : null}
    </Scroll>
  )
}
