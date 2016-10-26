import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Link } from 'react-router'
import { createContainer } from 'meteor/react-meteor-data'
import { SettingsIcon, MenuItemSelectedIcon } from '../images/icons'
import { CircleAvatar } from '../images/avatar'

const menuItems = [
  {label: 'Profile', slug: 'profile'},
  {label: 'Change Password', slug: 'password'},
  {label: 'Team', slug: 'team'},
  {label: 'Sectors', slug: 'sector'}
]

const settingsPanel = {
  profile: <h1>Profile panel</h1>,
  password: <h1>Password panel</h1>,
  team: <h1>Team panel</h1>,
  sector: <h1>Sector panel</h1>
}

const SettingsPage = React.createClass({
  getInitialState () {
    return {
      selectedMenuItem: this.props.params.selected || 'profile'
    }
  },
  componentWillReceiveProps (props) {
    this.setState({selectedMenuItem: props.params.selected})
  },
  render () {
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
          {settingsPanel[this.state.selectedMenuItem]}
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  return { user: Meteor.user() }
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
  return (
    <nav className='bg-white border-top border-left border-right border-gray80'>
      {menuItems.map((navItem) => {
        const activeClass = navItem.slug === selected ? 'active-side-nav-menu-item' : ''
        const activeIcon = navItem.slug === selected ? <span className='right pr1'><MenuItemSelectedIcon /></span> : ''
        return <Link to={`/settings/${navItem.slug}`} key={navItem.slug}>
          <div className={`py4 px2 border-bottom border-gray80 ${activeClass}`}>{navItem.label}{activeIcon}</div>
        </Link>
      })}
    </nav>
  )
}
