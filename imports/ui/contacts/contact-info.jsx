import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { CircleAvatar, SquareAvatar } from '../images/avatar'
import { EmailIcon, FavouritesIconGold, FavouritesIcon } from '../images/icons'
import QuickAdd from '../lists/quick-add'
import InfoHeader from '../lists/info-header'
import AddToMasterList from '../lists/add-to-master-list'
import Tooltip from '../navigation/tooltip'

// Dummy data to be replaced with subscription data
const selectedMasterLists = [
  {_id: 0, label: 'Energy', slug: 'energy'},
  {_id: 0, label: 'Healthcare', slug: 'healthcare'},
  {_id: 0, label: 'Personal Fitness', slug: 'personal-fitness'}
]
const allMasterLists = [
  {_id: 0, label: 'Energy', slug: 'energy', count: 12},
  {_id: 0, label: 'Healthcare', slug: 'healthcare', count: 3},
  {_id: 0, label: 'Personal Fitness', slug: 'personal-fitness', count: 1},
  {_id: 0, label: 'Robotics', slug: 'robotics', count: 15},
  {_id: 0, label: 'Technology', slug: 'technology', count: 8},
  {_id: 0, label: 'Money and Glory', slug: 'money-and-glory'},
  {_id: 0, label: 'Quietness', slug: 'quietness'},
  {_id: 0, label: 'Fashion Bloggers', slug: 'fashion-bloggers', count: 7}
]
// END of dummy data

const ContactInfo = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    user: PropTypes.object,
    onEditClick: PropTypes.func
  },

  getInitialState () {
    return {
      showMore: false,
      addToMasterListOpen: false
    }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  onAddToMasterList () {
    this.setState({addToMasterListOpen: true})
  },

  dismissAddToMasterList () {
    this.setState({addToMasterListOpen: false})
  },

  onUpdateMasterList (payload) {
    console.log(payload)
  },

  onAddTags () {
    console.log(`TODO: add a tag to ${this.props.contact.name}'s contact`)
  },

  onToggleFavourite () {
    Meteor.call('contacts/toggle-favourite', this.props.contact.slug, (err) => {
      if (err) console.error('Could not toggle favourite status for contact', err)
    })
  },

  render () {
    if (!this.props.contact) return null
    const { onAddToMasterList, onAddTags, dismissAddToMasterList, onUpdateMasterList } = this
    const { addToMasterListOpen, showMore } = this.state
    const { user: { myContacts }, contact: { _id, name, avatar, emails, outlets, medialists } } = this.props
    const isFavourite = myContacts.some((c) => c._id === _id)
    const Icon = isFavourite ? FavouritesIconGold : FavouritesIcon
    const tooltip = isFavourite ? 'Remove from My Contacts' : 'Add to My Contacts'
    return (
      <div>
        <div className='mb1'>
          <CircleAvatar className='ml2' size={70} avatar={avatar} name={name} />
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl mb1'>
              {name}
              <Tooltip title={tooltip}>
                <Icon className='mx2 pointer svg-icon-lg align-bottom' onClick={this.onToggleFavourite} />
              </Tooltip>
            </span>
            <span className='block f-sm'>{(outlets && outlets.length) ? outlets[0].value : null}</span>
            <span className='block f-sm'>{outlets.map((o) => o.label).join(', ')}</span>
          </div>
        </div>
        <div className='clearfix p3 pt4 mt4 border-gray80 border-bottom'>
          <a href='#' className='f-xs blue right' onClick={this.props.onEditClick}>Edit Contact</a>
          <h1 className='m0 f-md normal gray20 left'>Info</h1>
        </div>
        <div className='clearfix p3'>
          <ul className='list-reset'>
            <ContactEmailItem emails={emails} />
          </ul>
          <a href='#' className='f-sm blue my3' onClick={this.onShowMoreToggleClick}>Show {showMore ? 'Less' : 'More'}</a>
        </div>
        {medialists.length > 0 &&
          <section>
            <InfoHeader name='Campaigns' />
            <div className='px2 py3'>
              {medialists.map((campaign) => {
                return <SquareAvatar name={campaign} size={38} style={{marginRight: '2px', marginBottom: '2px'}} />
              })}
            </div>
          </section>
        }
        <AddToMasterList
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={onUpdateMasterList}
          selectedMasterLists={selectedMasterLists}
          allMasterLists={allMasterLists}
          title='Contact' />
        <QuickAdd
          selectedMasterLists={selectedMasterLists}
          tags={[
            {
              _id: 'mongoidfornhs',
              name: 'NHS',
              count: 23
            },
            {
              _id: 'mongoidfortechnology',
              name: 'Technology',
              count: 78
            }
          ]}
          onAddTags={onAddTags}
          onAddToMasterList={onAddToMasterList} />
      </div>
    )
  }
})

const ContactEmailItem = ({ emails }) => {
  if (!emails || !emails.length) return null
  const email = emails[0].value

  return (
    <li>
      <a href={`mailto:${encodeURIComponent(email)}`} className='hover-blue'>
        <EmailIcon /> {email}
      </a>
    </li>
  )
}

export default ContactInfo
