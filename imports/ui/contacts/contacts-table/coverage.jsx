import React from 'react'
import PropTypes from 'prop-types'
import uniq from 'lodash.uniq'
import { Select, Option } from '/imports/ui/navigation/select'
import { SquareAvatar } from '/imports/ui/images/avatar'
import Tooltip from '/imports/ui/navigation/tooltip'
import { CoverageIcon } from '/imports/ui/images/icons'

export default function Coverage ({ posts }) {
  if (!posts.length) return <span className='gray60'>No coverage yet</span>

  const uniqEmbeds = uniq(
    posts
      .map(post => post.embeds)
      .reduce((a, b) => a.concat(b))
  )

  const postsWithoutUrl = posts.filter(post => post.embeds.length === 0)

  // Either an embed with `url` property, or a post with `message` property
  const allItems = uniqEmbeds.concat(postsWithoutUrl)

  const [ first, second, ...more ] = allItems

  return (
    <span>
      <CoverageSquare item={first} />
      {second ? <CoverageSquare item={second} /> : null}
      {more.length ? (
        <Select
          width={250}
          buttonText={<span className='gray60'>+{more.length}</span>}
          style={{cursor: 'pointer'}}
          data-id='more-coverage-select'>
          {() => more.map(item => (
            <Option key={item.url || item.message}>
              <CoverageOption item={item} />
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

const PrettyUrl = ({url, ...props}) => (
  <span {...props}>{url.replace(/^https?:\/\/(www\.)?/, '')}</span>
)

const MaybeLink = ({href, target, children, ...props}) => {
  if (href) {
    return <a href={href} target={target} {...props}>{children}</a>
  } else {
    return <span {...props}>{children}</span>
  }
}

const UrlOrMessage = ({item, ...props}) => {
  const {url, message} = item
  if (url) {
    return <PrettyUrl url={url} {...props} />
  } else {
    return <span {...props}>{message}</span>
  }
}

const CoverageSquare = ({ item }) => {
  const {url, icon} = item
  const titleStyle = {
    display: 'inline-block',
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  return (
    <MaybeLink href={url} target='_blank' className='mr1' data-id='coverage-post'>
      <Tooltip title={<UrlOrMessage item={item} style={titleStyle} />}>
        {icon
          ? <SquareAvatar avatar={icon.url} size={20} />
          : <CoverageIcon style={{ width: '20px', height: '20px' }} />}
      </Tooltip>
    </MaybeLink>
  )
}

const CoverageOption = ({ item }) => {
  const { url, icon } = item
  return (
    <MaybeLink href={url} target='_blank' data-id='coverage-post'>
      <span className='mr2'>
        {icon
          ? <SquareAvatar avatar={icon.url} size={20} />
          : <CoverageIcon style={{ width: '20px', height: '20px' }} />}
      </span>
      <UrlOrMessage item={item} style={{ verticalAlign: 'middle' }} />
    </MaybeLink>
  )
}
