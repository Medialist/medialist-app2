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
  FeedNeedToKnowIcon,
  StatusUpdateIcon
} from '../images/icons'

const Post = ({icon, summary, details, createdBy, createdAt, currentUser, bgClass = 'bg-white'}) => (
  <article className={`flex rounded px4 pt3 pb2 mb2 shadow-2 ${bgClass}`}>
    <div className='flex-none' style={{paddingTop: 1}}>
      <CircleAvatar size={38} avatar={createdBy.avatar} name={createdBy.name} style={{marginRight: 13}} />
      {icon}
    </div>
    <div className='flex-auto' style={{paddingLeft: 13}}>
      <header className='pt2 pb3 f-md flex nowrap'>
        <YouOrName className='semibold align-middle' currentUser={currentUser} user={createdBy} />
        <div className='align-middle flex-auto truncate' style={{paddingLeft: 3}}>{summary}</div>
        <span className='f-sm semibold gray60 flex-none'>
          <Time date={createdAt} />
        </span>
      </header>
      {details}
    </div>
  </article>
)

const ContactLink = ({slug, name, outletName}) => (
  <Link to={`/contact/${slug}`}>
    <span className='semibold gray10'>{name}</span>
    { outletName &&
      <span className='gray10'> ({outletName})</span>
    }
  </Link>
)

const CampaignLink = ({slug, name}) => (
  <Link className='semibold gray10' to={`/campaign/${slug}`}>{name}</Link>
)

const ContactNamesOrCount = ({items}) => {
  const text = items.length > 2 ? items.length + ' contacts' : items.map((i) => i.name.split(' ')[0]).join(' and ')
  return <span>{` ${text} `}</span>
}

const PostSummary = ({label, campaigns, contacts, status, hideContact, hideCampaign}) => (
  <span className='nowrap flex'>
    <span className='truncate align-middle'>
      <span className='gray10'>
        {label}
      </span>
      { !hideContact && contacts && (
        <span>
          <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
          <ContactLink {...contacts[0]} />
        </span>
      )}
      { !hideCampaign && campaigns && campaigns[0] && (
        <span>
          <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
          <CampaignLink {...campaigns[0]} />
        </span>
      )}
    </span>
    { status && (
      <span className='flex-none align-middle'>
        <Status status={status} />
      </span>
    )}
  </span>
)

export const FeedbackPost = ({item, currentUser, hideContact, hideCampaign}) => (
  <Post
    {...item}
    currentUser={currentUser}
    icon={<FeedFeedbackIcon className='blue' style={{verticalAlign: -2}} />}
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
    icon={<FeedCoverageIcon className='blue' />}
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
    bgClass='bg-yellow-lighter'
    currentUser={currentUser}
    icon={<FeedNeedToKnowIcon className='orange' />}
    summary={<PostSummary {...item} label='shared a need-to-know' hideContact={hideContact} />}
    details={
      <div className='border-gray80 border-top py3 gray10'>
        {item.message}
      </div>
    }
  />
)

export const StatusUpdate = ({item, currentUser}) => {
  const contact = item.contacts[0]
  const name = contact ? contact.name.split(' ')[0] : 'a contact'
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<StatusUpdateIcon className='gray60' />}
      summary={<PostSummary {...item} label={`updated ${name} for`} hideContact />}
    />
  )
}

export const AddContactsToCampaign = ({item, currentUser}) => {
  const {contacts, campaigns} = item
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<FeedContactIcon className='gray40' />}
      summary={
        <span>
          added <ContactNamesOrCount items={contacts} /> to <CampaignLink {...campaigns[0]} />
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
      icon={<FeedCampaignIcon className='status-blue' />}
      summary='created a campaign'
      details={
        <div className='border-gray80 border-top pt2'>
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

