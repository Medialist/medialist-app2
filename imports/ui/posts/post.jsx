import React from 'react'
import { Link } from 'react-router'
import { CircleAvatar, SquareAvatar } from '../images/avatar'
import Time from '../time/time'
import YouOrName from '../users/you-or-name'
import Status from '../feedback/status'
import {
  ChevronRight,
  FeedCampaignIcon,
  FeedContactIcon,
  FeedCoverageIcon,
  FeedFeedbackIcon,
  FeedNeedToKnowIcon
} from '../images/icons'

const Post = ({icon, summary, details, createdBy, createdAt, currentUser}) => (
  <article className='flex rounded bg-white px4 pt3 pb2 mb2 shadow-2'>
    <div className='flex-none' style={{paddingTop: 1}}>
      <CircleAvatar size={38} avatar={createdBy.avatar} name={createdBy.name} style={{marginRight: 13}} />
      {icon}
    </div>
    <div className='flex-auto' style={{paddingLeft: 13}}>
      <header className='pt2 pb3 f-md'>
        <span className='f-sm semibold gray60 right'>
          <Time date={createdAt} />
        </span>
        <YouOrName className='semibold align-middle flex-none' currentUser={currentUser} user={createdBy} />
        {summary}
      </header>
      {details}
    </div>
  </article>
)

const ContactLink = ({slug, name}) => (
  <Link className='semibold gray10' to={`/contact/${slug}`}>{name}</Link>
)

const CampaignLink = ({slug, name}) => (
  <Link className='semibold gray10' to={`/campaign/${slug}`}>{name}</Link>
)

const ContactNamesOrCount = ({items}) => {
  if (items.length > 2) return items.length + ''
  return items.map((i) => i.name.split(' ')[0]).join(' and ')
}

const PostSummary = ({label, campaigns, contacts, status, hideContact, hideCampaign}) => (
  <span className='flex-auto' style={{whiteSpace: 'nowrap'}}>
    <span className='inline-block truncate align-middle'>
      <span className='gray10 ml1'>
        {label}
      </span>
      { !hideContact && contacts && (
        <span>
          <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
          <ContactLink {...contacts[0]} />
        </span>
      )}
      { !hideCampaign && campaigns && (
        <span>
          <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
          <CampaignLink {...campaigns[0]} />
        </span>
      )}
    </span>
    <span className='inline-block align-middle'>
      <Status status={status} />
    </span>
  </span>
)

export const FeedbackPost = ({item, currentUser, hideContact, hideCampaign}) => (
  <Post
    {...item}
    currentUser={currentUser}
    icon={<FeedFeedbackIcon style={{color: 'blue', verticalAlign: -2}} />}
    summary={<PostSummary {...item} label='logged feedback' hideContact={hideContact} hideCampaign={hideCampaign} />}
    details={
      <div className='border-gray80 border-top py3 gray10'>
        {item.message}
      </div>
    }
  />
)

export const CoveragePost = ({item, currentUser, hideContact, hideCampaign}) => (
  <Post
    {...item}
    currentUser={currentUser}
    icon={<FeedCoverageIcon style={{color: 'blue'}} />}
    summary={<PostSummary {...item} label='logged coverage' hideContact={hideContact} hideCampaign={hideCampaign} />}
    details={
      <div className='border-gray80 border-top py3 gray10'>
        {item.message}
      </div>
    }
  />
)

export const NeedToKnowPost = ({item, currentUser, hideContact}) => (
  <Post
    {...item}
    currentUser={currentUser}
    icon={<FeedNeedToKnowIcon style={{color: 'orange'}} />}
    summary={<PostSummary {...item} label='shared a need-to-know' hideContact={hideContact} />}
    details={
      <div className='border-gray80 border-top py3'>
        {item.message}
      </div>
    }
  />
)

export const ContactsAddedToCampaign = ({item, currentUser}) => {
  const {contacts, campaigns} = item
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<FeedContactIcon style={{color: 'gray40'}} />}
      summary={
        <span>
          added
          <ContactNamesOrCount items={contacts} />
          to
          <CampaignLink {...campaigns[0]} />
        </span>
      }
    />
  )
}

export const CreateCampaign = ({item, currentUser}) => {
  const {slug, avatar, name, clientName} = item.campaigns[0]
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<FeedCampaignIcon style={{color: 'blue'}} />}
      summary={<span>created a campaign</span>}
      details={
        <div className='border-gray80 border-top py3'>
          <Link key={slug} to={`/campaign/${slug}`} className='block py1' title={name}>
            <SquareAvatar size={38} avatar={avatar} name={name} />
            <div className='inline-block align-middle'>
              <div className='ml3 semibold f-md gray10'>{name}</div>
              <div className='ml3 regular f-sm gray20' style={{marginTop: 2}}>
                {clientName}
              </div>
            </div>
          </Link>
        </div>
      }
    />
  )
}

