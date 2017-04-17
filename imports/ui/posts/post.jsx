import React from 'react'
import { Link } from 'react-router'
import dasherise from 'dasherize'
import { CircleAvatar } from '../images/avatar'
import Time from '../time/time'
import YouOrName from '../users/you-or-name'
import Status from '../feedback/status'
import LinkPreview from '../feedback/link-preview'
import CampaignPreview from '../campaigns/campaign-preview'
import {
  ChevronRight,
  FeedCampaignIcon,
  FeedContactIcon,
  FeedCoverageIcon,
  FeedFeedbackIcon,
  FeedNeedToKnowIcon,
  StatusUpdateIcon
} from '../images/icons'

const Post = ({icon, summary, details, createdBy, createdAt, currentUser, type, bgClass = 'bg-white', contacts, campaigns}) => {
  const data = {
    'data-contact': contacts.map(contact => contact._id).join(' '),
    'data-campaign': campaigns.map(campaigns => campaigns._id).join(' ')
  }

  return (
    <article className={`flex rounded px4 pt3 pb2 mb2 shadow-2 ${bgClass}`} data-id={dasherise(type)} {...data}>
      <div className='flex-none' style={{paddingTop: 1}}>
        <CircleAvatar size={38} avatar={createdBy.avatar} name={createdBy.name} style={{marginRight: 13}} />
        {icon}
      </div>
      <div className='flex-auto' style={{paddingLeft: 13}}>
        <header className='pt2 pb3 f-md flex nowrap' data-id='post-header'>
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
}

const ContactLink = ({contact, ...props}) => (
  <Link to={`/contact/${contact.slug}`} data-id='contact-link' {...props}>
    <span className='semibold gray10' data-id='contact-name'>{contact.name}</span>
    { contact.outletName && <span className='gray10' data-id='contact-outlet'> ({contact.outletName})</span> }
  </Link>
)

const CampaignLink = ({campaign}) => (
  <Link className='semibold gray10' to={`/campaign/${campaign.slug}`} data-id='campaign-link'>
    <span data-id='campaign-name'>{campaign.name}</span>
  </Link>
)

const ContactName = ({contacts, onContactPage}) => {
  if (contacts.length === 1 && onContactPage) {
    return <span data-id='contact-name'>{firstName(contacts[0])}</span>
  }

  if (contacts.length > 1) {
    return <span data-id='contact-name'>{contacts.length} contacts</span>
  }

  return <ContactLink contact={contacts[0]} />
}

const CampaignName = ({campaigns, onCampaignPage}) => {
  if (onCampaignPage) {
    return null
  }

  return <span> to <CampaignLink campaign={campaigns[0]} /></span>
}

const firstName = ({name}) => name.split(' ')[0]

const PostSummary = ({children, status}) => (
  <span className='nowrap flex'>
    <span className='truncate align-middle' data-id='post-summary'>
      {children}
    </span>
    { status &&
      <span className='flex-none align-middle' data-id='contact-status'>
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
        <CampaignLink campaign={campaigns[0]} />
      </span>
    )}
    { !contact && contacts && (
      <span>
        <ChevronRight className='f-xxxs gray60' />
        <ContactLink contact={contacts[0]} />
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
      <div className='border-gray80 border-top py3 gray10' data-id='post-message'>
        {item.message}
        {item.embeds && item.embeds[0] ? (
          <div className='pt3'>
            <LinkPreview {...item.embeds[0]} />
          </div>
        ) : null}
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
      <div className='border-gray80 border-top py3 gray10' data-id='post-message'>
        {item.message}
        {item.embeds && item.embeds[0] ? (
          <div className='pt3'>
            <LinkPreview {...item.embeds[0]} />
          </div>
        ) : null}
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
      <div className='border-gray80 border-top py3 gray10' data-id='post-message'>
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
          updated {name} for <CampaignLink campaign={item.campaigns[0]} />
        </PostSummary>
      }
    />
  )
}

export const AddContactsToCampaign = ({item, currentUser, contact, campaign}) => {
  return (
    <Post
      {...item}
      currentUser={currentUser}
      icon={<FeedContactIcon className='gray60' />}
      summary={
        <span data-id='post-summary'>
          added <ContactName contacts={item.contacts} onContactPage={Boolean(contact)} />
          <CampaignName campaigns={item.campaigns} onCampaignPage={Boolean(campaign)} />
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
            <CampaignPreview name={name} avatar={avatar} clientName={clientName} />
          </Link>
        </div>
      }
    />
  )
}
