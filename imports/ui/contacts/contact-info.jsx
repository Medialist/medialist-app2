import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { CircleAvatar, SquareAvatar } from '../images/avatar'
import { EmailIcon, FavouritesIconGold, FavouritesIcon, PhoneIcon, BioIcon, MobileIcon, AddressIcon } from '../images/icons'
import { setMasterLists } from '/imports/api/master-lists/methods'
import QuickAdd from '../lists/quick-add'
import InfoHeader from '../lists/info-header'
import AddToMasterList from '../master-lists/add-to-master-list.jsx'
import AddTags from '../tags/add-tags'
import Tooltip from '../navigation/tooltip'
import SocialLinks from './contact-social-links'

const ContactInfo = React.createClass({
  propTypes: {
    campaigns: PropTypes.array,
    contact: PropTypes.object,
    user: PropTypes.object,
    onEditClick: PropTypes.func,
    masterlists: PropTypes.array
  },

  getInitialState () {
    return {
      addToMasterListOpen: false,
      addTagsOpen: false
    }
  },

  onAddToMasterList () {
    this.setState({addToMasterListOpen: true})
  },

  dismissAddToMasterList () {
    this.setState({addToMasterListOpen: false})
  },

  onAddContactToMasterLists ({item, masterLists}) {
    setMasterLists.call({type: 'Contacts', item, masterLists})
  },

  onAddTags () {
    this.setState({addTagsOpen: true})
  },

  dismissAddTags () {
    this.setState({addTagsOpen: false})
  },

  onUpdateTags (tags) {
    console.log(tags)
  },

  onToggleFavourite () {
    Meteor.call('contacts/toggle-favourite', this.props.contact.slug, (err) => {
      if (err) console.error('Could not toggle favourite status for contact', err)
    })
  },

  render () {
    if (!this.props.contact) return null
    const {
      onAddToMasterList,
      dismissAddToMasterList,
      onAddContactToMasterLists,
      onAddTags,
      dismissAddTags,
      onUpdateTags
    } = this
    const { addToMasterListOpen, addTagsOpen } = this.state
    const { user: { myContacts }, contact, campaigns } = this.props
    const { _id, name, avatar, outlets, masterLists, tags } = contact
    const isFavourite = myContacts.some((c) => c._id === _id)
    const Icon = isFavourite ? FavouritesIconGold : FavouritesIcon
    const tooltip = isFavourite ? 'Remove from My Contacts' : 'Add to My Contacts'
    const { socials } = contact

    return (
      <div>
        <div className='mb1 clearfix'>
          <div className='col col-3'>
            <CircleAvatar className='ml2' size={70} avatar={avatar} name={name} />
          </div>
          <div className='col col-9 pl3'>
            <div className='semibold f-xl gray10'>
              {name}
              <Tooltip title={tooltip}>
                <Icon className='mx2 pointer svg-icon-lg align-bottom gray40' onClick={this.onToggleFavourite} />
              </Tooltip>
            </div>
            <div style={{paddingTop: 4}}>
              <div className='f-sm gray10'>{(outlets && outlets.length) ? outlets[0].value : null}</div>
              <div className='f-sm gray10' style={{paddingTop: 2}}>{outlets.map((o) => o.label).join(', ')}</div>
            </div>
            <div className='pt4'>{socials.map((social) => <SocialLinks {...social} />)}</div>
          </div>
        </div>
        <div className='clearfix p3 pt4 mt4 border-gray80 border-bottom'>
          <a href='#' className='f-sm blue right' onClick={this.props.onEditClick}>Edit</a>
          <h1 className='m0 f-md normal gray20 left'>Info</h1>
        </div>
        <div className='clearfix'>
          <ContactItems contact={contact} />
        </div>
        <section>
          <InfoHeader name='Campaigns' />
          <div className='px2 py3'>
            {campaigns.map(({slug, avatar, name}) => (
              <Link
                key={slug}
                to={`/campaign/${slug}`}
                style={{marginRight: '2px', marginBottom: '2px'}}
              >
                <SquareAvatar name={name} avatar={avatar} size={38} />
              </Link>
            ))}
          </div>
        </section>
        <AddToMasterList
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={onAddContactToMasterLists}
          selected={masterLists}
          type='Contacts'
          title={`Add ${name} to a Master List`} />
        <AddTags
          type='Contacts'
          open={addTagsOpen}
          onDismiss={dismissAddTags}
          title={`Tag ${name.split(' ')[0]}`}
          selectedTags={tags}
          onUpdateTags={onUpdateTags} />
        <QuickAdd
          selectedMasterLists={masterLists}
          tags={tags}
          onAddTags={onAddTags}
          onAddToMasterList={onAddToMasterList} />
      </div>
    )
  }
})

const ContactItems = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired
  },
  getInitialState () {
    return { showMore: false }
  },
  toggleShowMore () {
    this.setState(({showMore}) => ({ showMore: !this.state.showMore }))
  },
  render () {
    const {
      emails,
      phones,
      bio,
      address
    } = this.props.contact
    emails.slice(0, 1) // limit to most recent email address
    const { showMore } = this.state

    return (
      <ul className='list-reset'>
        <li className='mb2'>
          {emails.map((email) => <ContactItemsEmail email={email} />)}
        </li>
        <li className='mb2'>
          {phones.map((phone) => <ContactItemsPhone phone={phone} />)}
        </li>
        <li className='mb2'>
          <ContactItemBio bio={bio} />
        </li>
        {showMore && address && (
          <li><ContactItemAddress address={address} /></li>
        )}
        {address && (
          <li>
            <a href='#' className='block f-sm bold blue m3' onClick={this.toggleShowMore}>Show {showMore ? 'Less' : 'More'}</a>
          </li>
        )}
      </ul>
    )
  }
})

const ContactItemsEmail = ({ email }) => {
  if (!email) return null
  const { value } = email
  return (
    <div>
      <a href={`mailto:${encodeURIComponent(value)}`} className='hover-blue block py1 clearfix'>
        <div className='col col-2 center'><EmailIcon /></div>
        <div className='col col-10 f-sm gray10'>{value}</div>
      </a>
    </div>
  )
}

const ContactItemsPhone = ({ phone }) => {
  const { label, value } = phone
  const Icon = label === 'Mobile' ? MobileIcon : PhoneIcon
  return (
    <div className='mb2'>
      <a href={`tel:${value}`} className='hover-blue block py1 clearfix'>
        <div className='col col-2 center'><Icon /></div>
        <div className='col col-10 f-sm gray10'>{value}</div>
      </a>
    </div>
  )
}

const ContactItemBio = ({ bio }) => {
  if (!bio) return null
  return (
    <div>
      <a className='block py1 clearfix'>
        <div className='col col-2 center'><BioIcon className='gray60' /></div>
        <div className='col col-10 f-sm gray10' style={{lineHeight: '22px'}}>{bio}</div>
      </a>
    </div>
  )
}

const ContactItemAddress = ({ address }) => {
  return (
    <div>
      <a className='block py1 clearfix'>
        <div className='col col-2 center'><AddressIcon className='gray60' /></div>
        <div className='col col-10 f-sm gray10'>{address.split(',').map((line) => <div className='block mb2'>{line}</div>)}</div>
      </a>
    </div>
  )
}

export default ContactInfo
