import { Meteor } from 'meteor/meteor'
import MasterLists from '/imports/api/master-lists/master-lists'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { createContainer } from 'meteor/react-meteor-data'
import { SettingsIcon, ChevronRight } from '/imports/ui/images/icons'
import SettingsProfile from '/imports/ui/users/settings/profile'
import CampaignsMasterLists from '/imports/ui/users/settings/campaigns-master-lists'
import ContactsMasterLists from '/imports/ui/users/settings/contacts-master-lists'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'

const menuItems = [
  {label: 'Profile', slug: 'profile'},
  {label: 'Campaign Lists', slug: 'campaigns-master-lists'},
  {label: 'Contact Lists', slug: 'contacts-master-lists'}
]

const SettingsPage = withSnackbar(React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    campaignsMasterLists: PropTypes.array,
    contactsMasterLists: PropTypes.array,
    params: PropTypes.object
  },
  getInitialState () {
    return {
      selectedMenuItem: this.props.params.selected || 'profile',
      deleteListModal: false
    }
  },
  componentWillReceiveProps (props) {
    this.setState({selectedMenuItem: props.params.selected || 'profile'})
  },
  onAddMasterList ({type, name}) {
    Meteor.call('MasterLists/create', {type, name}, (error) => {
      const eventType = type.toLowerCase().substring(0, type.length - 1)

      if (error) {
        console.error(error)
        this.props.snackbar.error(`create-${eventType}-list-failure`)
      } else {
        this.props.snackbar.show(`Created ${name}`, `create-${eventType}-list-success`)
      }
    })
  },
  onUpdateMasterList ({type, name, _id}) {
    Meteor.call('MasterLists/update', {_id, name}, (error) => {
      const eventType = type.toLowerCase().substring(0, type.length - 1)

      if (error) {
        console.error(error)
        this.props.snackbar.error(`update-${eventType}-list-failure`)
      } else {
        this.props.snackbar.show(`Updated ${name}`, `update-${eventType}-list-success`)
      }
    })
  },
  onDeleteMasterList (type, name, _id) {
    this.setState({
      deleteListModal: true
    })
  },
  render () {
    const { user, campaignsMasterLists, contactsMasterLists } = this.props
    const settingsPanel = {
      profile: <SettingsProfile user={user} />,
      'campaigns-master-lists': <CampaignsMasterLists masterlists={campaignsMasterLists} {...this} />,
      'contacts-master-lists': <ContactsMasterLists masterlists={contactsMasterLists} {...this} />
    }
    const { selectedMenuItem } = this.state
    return (
      <div className='flex max-width-4 mx-auto my4 pt4'>
        <div className='flex-none mr4 xs-hide sm-hide' style={{width: 250}}>
          <article>
            <label className='gray40'><SettingsIcon /> My Settings </label>
            <nav className='mt2 bg-white border-top border-left border-right border-gray80'>
              <SideMenuItem selected={selectedMenuItem} item={menuItems[0]} data-id='profile-settings-button' />
            </nav>
            <label className='inline-block gray40 mt5 mb4'><SettingsIcon /> Organisation Settings </label>
            <nav className='mt2 bg-white border-top border-left border-right border-gray80'>
              <SideMenuItem selected={selectedMenuItem} item={menuItems[1]} data-id='campaign-lists-button' />
              <SideMenuItem selected={selectedMenuItem} item={menuItems[2]} data-id='contact-lists-button' />
            </nav>
          </article>
        </div>
        <div className='flex-auto px2 bg-white shadow-2'>
          {settingsPanel[selectedMenuItem]}
        </div>
      </div>
    )
  }
}))

export default createContainer(() => {
  return {
    user: Meteor.user(),
    contactsMasterLists: MasterLists.find({type: 'Contacts'}, {sort: {createdAt: -1}}).fetch(),
    campaignsMasterLists: MasterLists.find({type: 'Campaigns'}, {sort: {createdAt: -1}}).fetch()
  }
}, SettingsPage)

function SideMenuItem ({selected, item, ...props}) {
  const { slug, label } = item
  const activeClass = slug === selected ? 'active' : ''
  const activeIcon = slug === selected ? <span className='right pr1'><ChevronRight /></span> : ''
  return (
    <Link to={`/settings/${slug}`} key={slug} data-id={props['data-id']}>
      <div className={`py3 pl3 pr2 border-bottom border-gray80 active-border-left-blue active-blue ${activeClass}`}>{label}{activeIcon}</div>
    </Link>
  )
}
