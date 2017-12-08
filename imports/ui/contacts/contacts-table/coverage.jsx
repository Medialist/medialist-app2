import React from 'react'
import PropTypes from 'prop-types'
import { Select, Option } from '/imports/ui/navigation/select'
import { SquareAvatar } from '/imports/ui/images/avatar'
import Tooltip from '/imports/ui/navigation/tooltip'

export default function Coverage ({ posts }) {
  if (!posts.length) return <span className='gray60'>No coverage yet</span>

  const [ firstPost, secondPost, ...morePosts ] = posts

  return (
    <span>
      <PostSquare post={firstPost} />
      {secondPost ? <PostSquare post={secondPost} /> : null}
      {morePosts.length ? (
        <Select
          width={250}
          alignRight
          buttonText={<span className='gray60 mr1' style={{cursor: 'pointer'}}>+{morePosts.length}</span>}>
          {morePosts.map(post => (
            <Option key={post._id}>
              <PostOption post={post} />
            </Option>
          ))}
        </Select>
      ) : null}
    </span>
  )
}

Coverage.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    embeds: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired
    })).isRequired
  })).isRequired
}

const PostSquare = ({ post }) => {
  const { url } = post.embeds[0]
  const titleStyle = {
    display: 'inline-block',
    maxWidth: '150px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const iconSrc = 'http://via.placeholder.com/20x20/000000/000000'

  return (
    <span onClick={() => window.open(url, '_blank')}>
      <Tooltip title={<span style={titleStyle}>{toPrettyUrl(url)}</span>}>
        <SquareAvatar avatar={iconSrc} size={20} className='mr1' />
      </Tooltip>
    </span>
  )
}

const PostOption = ({ post }) => {
  const { url } = post.embeds[0]
  const iconSrc = 'http://via.placeholder.com/20x20/000000/000000'

  const urlStyle = {
    display: 'inline-block',
    maxWidth: '150px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle'
  }

  return (
    <span onClick={() => window.open(url, '_blank')}>
      <SquareAvatar avatar={iconSrc} size={20} className='mr2' />
      <span style={urlStyle}>{toPrettyUrl(url)}</span>
    </span>
  )
}

function toPrettyUrl (url) {
  return url.replace(/^https?:\/\/(www\.)?/, '')
}
