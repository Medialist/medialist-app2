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
      <Post post={firstPost} />
      {secondPost ? <Post post={secondPost} /> : null}
      {morePosts.length ? (
        <Select
          width={250}
          alignRight
          buttonText={<span className='gray60'>+{morePosts.length}</span>}>
          {morePosts.map(post => (
            <Option key={post._id}>
              <Post post={post} />
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

const Post = ({ post }) => {
  const { url } = post.embeds[0]
  let prettyUrl = url.replace(/^https?:\/\//, '')

  const titleStyle = {
    maxWidth: '100px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const iconSrc = 'http://via.placeholder.com/20x20/000000/000000'

  return (
    <Tooltip title={<span style={titleStyle}>{prettyUrl}</span>}>
      <SquareAvatar avatar={iconSrc} size={20} onClick={() => window.open(url, '_blank')} />
    </Tooltip>
  )
}
