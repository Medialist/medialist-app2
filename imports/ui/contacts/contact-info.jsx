import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { CircleAvatar, SquareAvatar, avatarStyle } from '/imports/ui/images/avatar'
import { LinkedTag } from '/imports/ui/tags/tag'
import { EmailIcon, FavouritesIcon, PhoneIcon, BioIcon, MobileIcon, AddressIcon } from '/imports/ui/images/icons'
import { setMasterLists } from '/imports/api/master-lists/methods'
import InfoHeader from '/imports/ui/lists/info-header'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import Tooltip from '/imports/ui/navigation/tooltip'
import { SocialIcon } from '/imports/ui/social/social'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import ContactListLink from '/imports/ui/master-lists/contact-list-link'
import { GOLD, GREY60 } from '/imports/ui/colours'

const ContactInfo = withSnackbar(React.createClass({
  propTypes: {
    campaigns: PropTypes.array,
    contact: PropTypes.object,
    user: PropTypes.object,
    onEditClick: PropTypes.func,
    masterlists: PropTypes.array,
    onTagClick: PropTypes.func,
    onAddToCampaignClick: PropTypes.func
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

  onAddContactToMasterLists (masterLists) {
    setMasterLists.call({
      type: 'Contacts',
      item: this.props.contact._id,
      masterLists: masterLists.map(masterList => masterList._id)
    }, (error) => {
      if (error) {
        console.error(error)

        return this.props.snackbar.error('update-contact-contact-lists-failure')
      }

      this.props.snackbar.show(`Updated ${this.props.contact.name.split(' ')[0]}'s Contact Lists`, 'update-contact-contact-lists-success')
    })
  },

  onAddTags () {
    this.setState({addTagsOpen: true})
  },

  dismissAddTags () {
    this.setState({addTagsOpen: false})
  },

  onUpdateTags (tags) {
    Meteor.call('Tags/set', {
      type: 'Contacts',
      _id: this.props.contact._id,
      tags: tags.map((t) => t.name)
    }, (error) => {
      if (error) {
        console.error(error)

        return this.props.snackbar.error('update-contact-tags-failure')
      }

      this.props.snackbar.show(`Updated ${this.props.contact.name.split(' ')[0]}'s tags`, 'update-contact-tags-success')
    })
  },

  onToggleFavourite () {
    Meteor.call('contacts/toggle-favourite', this.props.contact.slug, (error, state) => {
      if (error) {
        console.error('Could not toggle favourite status for contact', error)
        this.props.snackbar.error('contact-favourite-failure')

        return
      }

      if (state) {
        this.props.snackbar.show(`Contact added to your favourites`, 'contact-info-favourite-success')
      } else {
        this.props.snackbar.show(`Contact removed from your favourites`, 'contact-info-unfavourite-success')
      }
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
    const { user: { myContacts }, contact, campaigns, onAddToCampaignClick } = this.props
    const { _id, name, avatar, outlets, masterLists, tags } = contact
    const isFavourite = myContacts.some((c) => c._id === _id)
    const tooltip = isFavourite ? 'Remove from My Contacts' : 'Add to My Contacts'
    const favouriteButtonId = isFavourite ? 'remove-from-my-contacts-button' : 'add-to-my-contacts-button'
    const { socials } = contact

    return (
      <div data-id='contact-info'>
        <div className='mb1 clearfix'>
          <div className='col col-3'>
            <CircleAvatar className='ml2' size={70} avatar={avatar} name={name} />
          </div>
          <div className='col col-9 pl3'>
            <div className='semibold f-xl gray10'>
              <span data-id='contact-name'>{name}</span>
              <Tooltip title={tooltip}>
                <FavouritesIcon data-id={favouriteButtonId} className='mx1 pointer' onClick={this.onToggleFavourite} style={{width: '18px', height: '18px', fill: isFavourite ? GOLD : GREY60}} svgStyle={{verticalAlign: '-1px'}} />
              </Tooltip>
            </div>
            <div style={{paddingTop: 4}}>
              <div className='f-sm gray10'>{(outlets && outlets.length) ? outlets[0].value : null}</div>
              <div className='f-sm gray10' style={{paddingTop: 2}}>{outlets.map((o) => o.label).join(', ')}</div>
            </div>
            <div className='pt4'>{socials.map((social, index) => <SocialIcon {...social} className='inline-block mr2 mb2' key={index} />)}</div>
          </div>
        </div>
        <div className='clearfix p2 pt4 mt4 border-gray80 border-bottom'>
          <a href='#' className='f-xs blue right' onClick={this.props.onEditClick} data-id='edit-contact-info-button'>Edit</a>
          <h1 className='m0 f-md normal gray20 left'>Info</h1>
        </div>
        <div className='clearfix'>
          <ContactItems contact={contact} />
        </div>
        <section>
          <InfoHeader name='Campaigns' onClick={onAddToCampaignClick} data-id='edit-contact-campaigns-button' />
          <div className='px2 py3' data-id='contact-campaigns-list'>
            {campaigns.slice(0, 5).map(({slug, avatar, name}) => (
              <Link
                key={slug}
                to={`/campaign/${slug}`}
                className='mr1 mb1'
              >
                <SquareAvatar name={name} avatar={avatar} size={38} showTooltip />
              </Link>
            ))}
            {campaigns.length > 5 && (
              <Link
                to={`/contact/${contact.slug}/campaigns`}
                className='mr1 mb1'
              >
                <span className='white bg-gray60 rounded semibold' style={avatarStyle(38)}>
                  {`+${campaigns.length - 5}`}
                </span>
              </Link>
            )}
          </div>
        </section>
        <section>
          <InfoHeader name='Contact Lists' onClick={onAddToMasterList} data-id='edit-contact-contact-lists-button' />
          <div className='px2 py3'>
            {masterLists.map((list, index) => (
              <span className='inline-block mr1' key={list._id}>
                <ContactListLink contactList={list} linkClassName='pointer blue f-sm semibold' />
                {masterLists.length > 1 && index < masterLists.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </section>
        <section>
          <InfoHeader name='Tags' onClick={onAddTags} data-id='edit-contact-tags-button' />
          <div className='px2 py3'>
            {tags.map((t) => (<LinkedTag to={`/contacts?tag=${t.slug}`} name={t.name} count={t.count} key={t.slug} />))}
          </div>
        </section>
        <AddToMasterListModal
          items={[this.props.contact]}
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={onAddContactToMasterLists}
          selectedMasterLists={masterLists}
          type='Contacts' />
        <AddTagsModal
          type='Contacts'
          open={addTagsOpen}
          onDismiss={dismissAddTags}
          selectedTags={tags}
          onUpdateTags={onUpdateTags} />
      </div>
    )
  }
}))

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
      addresses
    } = this.props.contact
    emails.slice(0, 1) // limit to most recent email address
    const { showMore } = this.state

    return (
      <ul className='list-reset'>
        <li className='mb2'>
          {emails.map((email, index) => <ContactItemsEmail key={`${email.value}-${index}`} email={email} />)}
        </li>
        <li className='mb2'>
          {phones.map((phone, index) => <ContactItemsPhone key={`${phone.value}-${index}`} phone={phone} />)}
        </li>
        <li className='mb2'>
          <ContactItemBio bio={bio} />
        </li>
        {showMore && addresses.length ? (
          <li><ContactItemAddress address={addresses[0]} /></li>
        ) : null}
        {addresses.length ? (
          <li>
            <a href='#' className='block f-sm bold blue m3' onClick={this.toggleShowMore}>Show {showMore ? 'Less' : 'More'}</a>
          </li>
        ) : null}
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
    <div>
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
    <a className='block py1 clearfix'>
      <div className='col col-2 center'><BioIcon className='gray60' /></div>
      <div className='col col-10 f-sm gray10' style={{lineHeight: '22px'}}>{bio}</div>
    </a>
  )
}

const ContactItemAddress = ({ address }) => {
  const lines = Object.keys(address).map(k => address[k]).filter((v) => !!v)
  const mapSearch = encodeURIComponent(lines.join(', '))
  return (
    <div className='py1 clearfix'>
      <a
        className='block col col-2 center'
        target='_blank'
        href={`http://maps.google.co.uk/?q=${mapSearch}`}
        title='View on Google Maps'
      >
        <AddressIcon className='gray60' />
      </a>
      <div className='col col-10 f-sm gray10'>
        {lines.map((line, i) => <div className='block mb2' key={i}>{line}</div>)}
      </div>
    </div>
  )
}

export default ContactInfo
