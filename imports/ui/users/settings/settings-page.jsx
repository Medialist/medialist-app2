import { Meteor } from 'meteor/meteor'
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { createContainer } from 'meteor/react-meteor-data'
import { SettingsIcon, MenuItemSelectedIcon } from '../../images/icons'
import { CircleAvatar } from '../../images/avatar'
import SettingsProfile from './profile'
import SettingsPassword from './password'
import SettingsTeam from './team'
import SettingsSector from './sectors'

const menuItems = [
  {label: 'Profile', slug: 'profile'},
  {label: 'Change Password', slug: 'password'},
  {label: 'Team', slug: 'team'},
  {label: 'Sectors', slug: 'sector'}
]

const SettingsPage = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    params: PropTypes.object
  },
  getInitialState () {
    return {
      selectedMenuItem: this.props.params.selected
    }
  },
  componentWillReceiveProps (props) {
    this.setState({selectedMenuItem: props.params.selected})
  },
  render () {
    const settingsPanel = {
      profile: <SettingsProfile user={this.props.user} />,
      password: <SettingsPassword />,
      team: <SettingsTeam />,
      sector: <SettingsSector />
    }
    return (
      <div className='flex max-width-lg mx-auto my4 pt4'>
        <div className='flex-none mr4 xs-hide sm-hide' style={{width: 250}}>
          <article>
            <label className='gray40'><SettingsIcon /> Settings / <span className='gray'>{this.state.selectedMenuItem}</span></label>
            <hr className='flex-auto mx2 py2' style={{height: 1}} />
            {userInfo(this.props.user)}
            {sideNav(this.state.selectedMenuItem)}
          </article>
        </div>
        <div className='flex-auto px2 bg-white'>
          {settingsPanel[this.state.selectedMenuItem || 'profile']}
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  Meteor.subscribe('userData')
  return { user: window.Meteor.users.find().fetch()[0] }
}, SettingsPage)

function userInfo (user) {
  return (
    <div className='py3'>
      <CircleAvatar name={user.profile.name} />
      <div className='inline-block align-middle pl2'>
        <div className='f-md semibold gray10'>{user.profile.name}</div>
        <div className='f-xs normal gray20'>{`Organisation name`}</div>
      </div>
    </div>
  )
}

function sideNav (selected) {
  selected = selected || 'profile'
  return (
    <nav className='mt2 bg-white border-top border-left border-right border-gray80'>
      {menuItems.map((navItem) => {
        const activeClass = navItem.slug === selected ? 'active-side-nav-menu-item' : ''
        const activeIcon = navItem.slug === selected ? <span className='right pr1'><MenuItemSelectedIcon /></span> : ''
        return (<Link to={`/settings/${navItem.slug}`} key={navItem.slug}>
          <div className={`py4 px2 border-bottom border-gray80 ${activeClass}`}>{navItem.label}{activeIcon}</div>
        </Link>)
      })}
    </nav>
  )
}
