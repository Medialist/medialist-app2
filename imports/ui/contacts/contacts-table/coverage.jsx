import React from 'react'
import PropTypes from 'prop-types'
import { Select, Option } from '/imports/ui/navigation/select'
import { SquareAvatar } from '/imports/ui/images/avatar'
import Tooltip from '/imports/ui/navigation/tooltip'
import { CoverageIcon } from '/imports/ui/images/icons'

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
          buttonText={<span className='gray60'>+{morePosts.length}</span>}
          style={{cursor: 'pointer'}}
          data-id='more-coverage-select'>
          {() => morePosts.map(post => (
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
  const { url, icon } = post.embeds[0]
  const titleStyle = {
    display: 'inline-block',
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  return (
    <a href={url} target='_blank' className='mr1' data-id='coverage-post'>
      <Tooltip title={<span style={titleStyle}>{toPrettyUrl(url)}</span>}>
        {icon
          ? <SquareAvatar avatar={icon} size={20} />
          : <CoverageIcon style={{ width: '20px', height: '20px' }} />}
      </Tooltip>
    </a>
  )
}

const PostOption = ({ post }) => {
  const { url, icon } = post.embeds[0]

  return (
    <a href={url} target='_blank' data-id='coverage-post'>
      <span className='mr2'>
        {icon
          ? <SquareAvatar avatar={icon} size={20} />
          : <CoverageIcon style={{ width: '20px', height: '20px' }} />}
      </span>
      <span style={{ verticalAlign: 'middle' }}>{toPrettyUrl(url)}</span>
    </a>
  )
}

function toPrettyUrl (url) {
  return url.replace(/^https?:\/\/(www\.)?/, '')
}
