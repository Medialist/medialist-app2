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
    <span className='semibold gray10'> {name} </span>
    { outletName &&
      <span className='gray10'> ({outletName}) </span>
    }
  </Link>
)

const CampaignLink = ({slug, name}) => (
  <Link className='semibold gray10' to={`/campaign/${slug}`}> {name} </Link>
)

const firstName = ({name}) => name.split(' ')[0]

const contactNamesOrCount = ({contacts, contact}) => {
  if (contact) return firstName(contact)
  if (contacts.length > 2) return `${contacts.length} contacts`
  return contacts.map(firstName).join(' and ')
}

const PostSummary = ({children, status}) => (
  <span className='nowrap flex'>
    <span className='truncate align-middle'>
      {children}
    </span>
    { status &&
      <span className='flex-none align-middle'>
        <Status status={status} />
      </span>
    }
  </span>
)

const FeedbackPostSummary = ({label, campaigns, contacts, status, contact, campaign}) => (
  <PostSummary status={status}>
    <span className='gray10'>
      {label}
    </span>
    { !campaign && campaigns && campaigns[0] && (
      <span>
        <ChevronRight className='f-xxxs gray60' />
        <CampaignLink {...campaigns[0]} />
      </span>
    )}
    { !contact && contacts && (
      <span>
        <ChevronRight className='f-xxxs gray60' />
        <ContactLink {...contacts[0]} />
      </span>
    )}
  </PostSummary>
)

export const FeedbackPost = ({item, currentUser, contact, campaign}) => (
  <Post
    {...item}
    currentUser={currentUser}
    icon={<FeedFeedbackIcon className='blue-dark' style={{verticalAlign: -2}} />}
    summary={<FeedbackPostSummary {...item} label='logged feedback' contact={contact} campaign={campaign} />}
    details={
      <div className='border-gray80 border-top py3 gray10'>
        {item.message}
      </div>
    }
  />
)

export const CoveragePost = ({item, currentUser, contact, campaign}) => (
  <Post
    {...item}
    currentUser={currentUser}
    icon={<FeedCoverageIcon className='blue' />}
    summary={<FeedbackPostSummary {...item} label='logged coverage' contact={contact} campaign={campaign} />}
    details={
      <div className='border-gray80 border-top py3 gray10'>
        {item.message}
      </div>
    }
  />
)

export const NeedToKnowPost = ({item, currentUser, contact}) => (
  <Post
    {...item}
    bgClass='bg-yellow-lighter'
    currentUser={currentUser}
    icon={<FeedNeedToKnowIcon className='tangerine' />}
    summary={<FeedbackPostSummary {...item} label='shared a need-to-know' contact={contact} />}
    details={
      <div className='border-gray80 border-top py3 gray10'>
        {item.message}
      </div>
    }
  />
)

export const StatusUpdate = ({item, currentUser, campaign}) => {
  const contact = item.contacts[0]
  const name = contact ? contact.name.split(' ')[0] : 'a contact'
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<StatusUpdateIcon className='gray60' />}
      summary={
        <PostSummary {...item}>
          updated {name} for <CampaignLink {...item.campaigns[0]} />
        </PostSummary>
      }
    />
  )
}

export const AddContactsToCampaign = ({item, currentUser, contact}) => {
  const {contacts, campaigns} = item
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<FeedContactIcon className='gray60' />}
      summary={
        <span>
          added {contactNamesOrCount({contacts, contact})} to <CampaignLink {...campaigns[0]} />
        </span>
      }
    />
  )
}

export const CreateCampaign = ({item, currentUser, campaign}) => {
  const {slug, avatar, name, clientName} = item.campaigns[0]
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<FeedCampaignIcon className='status-blue' />}
      summary='created this campaign'
      details={!campaign &&
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
